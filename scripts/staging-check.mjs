const required = ["SUPABASE_STAGING_URL", "SUPABASE_STAGING_ANON_KEY"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`staging:check CHECK_NOT_RUN: missing secure environment variables: ${missing.join(", ")}`);
  process.exit(2);
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(process.env.SUPABASE_STAGING_URL)) {
  console.error("staging:check FAIL: SUPABASE_STAGING_URL must be a Supabase HTTPS project URL");
  process.exit(1);
}

console.log("staging:check PASS: required staging variables are loaded");
