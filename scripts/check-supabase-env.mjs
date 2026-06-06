import fs from "node:fs";
import path from "node:path";

const PUBLIC_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const PUBLIC_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

const invalidTokens = new Set([
  "",
  "undefined",
  "null",
  "[your-password]",
  "your_key",
  "your-anon-key",
  "sb_publishable_your-key",
]);

function maskSecretForLog(secret) {
  if (!secret) return "[missing]";
  const trimmed = secret.trim();
  if (!trimmed) return "[missing]";
  if (trimmed.startsWith("sb_publishable_")) return `sb_publishable_...${trimmed.slice(-4)}`;
  if (trimmed.length <= 7) return "[masked]";
  return `${trimmed.slice(0, 3)}...${trimmed.slice(-3)}`;
}

function maskUrl(url) {
  if (!url) return "[missing]";
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return "[invalid-url]";
  }
}

function loadLocalEnv() {
  const files = [".env", ".env.local"];
  const loaded = {};

  for (const file of files) {
    const absolute = path.join(process.cwd(), file);
    if (!fs.existsSync(absolute)) continue;
    const content = fs.readFileSync(absolute, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(key in loaded)) loaded[key] = value;
      else loaded[key] = value;
    }
  }

  return loaded;
}

function validateSupabasePublicEnv(env = process.env) {
  const issues = [];
  const url = env[PUBLIC_URL_KEY]?.trim() ?? "";
  const anonKey = env[PUBLIC_ANON_KEY]?.trim() ?? "";

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !/\.supabase\.co$/i.test(parsed.hostname)) {
      issues.push(`${PUBLIC_URL_KEY} must match https://xxxxx.supabase.co`);
    }
  } catch {
    issues.push(`${PUBLIC_URL_KEY} is missing or invalid`);
  }

  const loweredKey = anonKey.toLowerCase();
  if (!anonKey) {
    issues.push(`${PUBLIC_ANON_KEY} is missing`);
  } else if (invalidTokens.has(loweredKey)) {
    issues.push(`${PUBLIC_ANON_KEY} looks like a placeholder`);
  } else if (anonKey.length < 20) {
    issues.push(`${PUBLIC_ANON_KEY} is too short to be a valid anon/publishable key`);
  }

  return {
    ok: issues.length === 0,
    issues,
    maskedUrl: maskUrl(url),
    maskedAnonKey: maskSecretForLog(anonKey),
    url,
    anonKey,
  };
}

async function probeSupabaseKey({ url, anonKey }) {
  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (response.ok) {
      return { state: "REMOTE_OK", status: response.status };
    }

    const body = await response.text();
    if (/Invalid API key/i.test(body)) {
      return { state: "INVALID_API_KEY", status: response.status };
    }

    return { state: "REMOTE_REJECTED", status: response.status };
  } catch {
    return { state: "REMOTE_UNREACHABLE", status: null };
  }
}

const localEnv = loadLocalEnv();
const mergedEnv = { ...localEnv, ...process.env };
const validation = validateSupabasePublicEnv(mergedEnv);

console.log(JSON.stringify({
  publicUrl: validation.maskedUrl,
  anonKey: validation.maskedAnonKey,
  ok: validation.ok,
  issues: validation.issues,
  envSources: {
    envFile: Object.keys(localEnv).length > 0 ? "LOADED_IF_PRESENT" : "NOT_FOUND",
    shellEnv: "MERGED_WITH_PRIORITY",
  },
  notes: [
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must belong to the same Supabase project.",
    "Load both variables in Vercel Preview and Production.",
    "Restart npm run dev after local env changes.",
    "Redeploy Vercel after dashboard env changes.",
  ],
}, null, 2));

if (!validation.ok) {
  process.exit(1);
}

const probe = await probeSupabaseKey(validation);
console.log(JSON.stringify({ remoteProbe: probe }, null, 2));

if (probe.state === "INVALID_API_KEY") {
  process.exit(1);
}
