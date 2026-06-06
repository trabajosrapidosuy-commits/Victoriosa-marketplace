const PUBLIC_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const PUBLIC_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

const INVALID_KEY_TOKENS = new Set([
  "",
  "undefined",
  "null",
  "[YOUR-PASSWORD]",
  "YOUR_KEY",
  "your-anon-key",
  "your_key",
  "anon-key",
  "sb_publishable_your-key",
]);

export class SupabasePublicEnvError extends Error {
  constructor(message: string, public readonly issues: string[]) {
    super(message);
  }
}

export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}

export interface SupabasePublicEnvValidation {
  ok: boolean;
  issues: string[];
  urlState: "valid" | "missing" | "invalid";
  keyState: "valid" | "missing" | "invalid";
  maskedUrl: string;
  maskedAnonKey: string;
}

export function getSupabasePublicEnv(env: NodeJS.ProcessEnv = process.env): SupabasePublicEnv {
  const validation = validateSupabasePublicEnv(env);
  if (!validation.ok) {
    throw new SupabasePublicEnvError(
      `[supabase-env] Invalid public Supabase configuration: ${validation.issues.join("; ")}`,
      validation.issues,
    );
  }

  return {
    url: env[PUBLIC_URL_KEY]!.trim(),
    anonKey: env[PUBLIC_ANON_KEY]!.trim(),
  };
}

export function validateSupabasePublicEnv(env: NodeJS.ProcessEnv = process.env): SupabasePublicEnvValidation {
  const issues: string[] = [];
  const rawUrl = env[PUBLIC_URL_KEY]?.trim() ?? "";
  const rawAnonKey = env[PUBLIC_ANON_KEY]?.trim() ?? "";

  const urlState = getUrlState(rawUrl, issues);
  const keyState = getKeyState(rawAnonKey, issues);

  return {
    ok: issues.length === 0,
    issues,
    urlState,
    keyState,
    maskedUrl: maskSupabaseUrl(rawUrl),
    maskedAnonKey: maskSecretForLog(rawAnonKey),
  };
}

export function maskSecretForLog(secret: string | undefined | null) {
  if (!secret) return "[missing]";
  const trimmed = secret.trim();
  if (trimmed.length === 0) return "[missing]";
  if (trimmed.startsWith("sb_publishable_")) {
    const suffix = trimmed.slice(-4);
    return `sb_publishable_...${suffix}`;
  }
  if (trimmed.length <= 7) return "[masked]";
  return `${trimmed.slice(0, 3)}...${trimmed.slice(-3)}`;
}

export function maskSupabaseUrl(url: string | undefined | null) {
  if (!url) return "[missing]";
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return "[invalid-url]";
  }
}

function getUrlState(rawUrl: string, issues: string[]): SupabasePublicEnvValidation["urlState"] {
  if (!rawUrl) {
    issues.push(`${PUBLIC_URL_KEY} is missing`);
    return "missing";
  }

  try {
    const parsed = new URL(rawUrl);
    const validHost = parsed.protocol === "https:" && /\.supabase\.co$/i.test(parsed.hostname);
    if (!validHost) {
      issues.push(`${PUBLIC_URL_KEY} must match https://xxxxx.supabase.co`);
      return "invalid";
    }
    return "valid";
  } catch {
    issues.push(`${PUBLIC_URL_KEY} must be a valid URL`);
    return "invalid";
  }
}

function getKeyState(rawAnonKey: string, issues: string[]): SupabasePublicEnvValidation["keyState"] {
  const lowered = rawAnonKey.toLowerCase();
  if (!rawAnonKey) {
    issues.push(`${PUBLIC_ANON_KEY} is missing`);
    return "missing";
  }
  if (INVALID_KEY_TOKENS.has(rawAnonKey) || INVALID_KEY_TOKENS.has(lowered)) {
    issues.push(`${PUBLIC_ANON_KEY} looks like a placeholder`);
    return "invalid";
  }
  if (rawAnonKey.length < 20) {
    issues.push(`${PUBLIC_ANON_KEY} is too short to be a real anon/publishable key`);
    return "invalid";
  }
  return "valid";
}
