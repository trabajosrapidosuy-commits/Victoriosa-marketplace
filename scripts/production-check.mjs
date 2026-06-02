import fs from "node:fs";

function parseEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

const env = { ...parseEnv(".env.example"), ...parseEnv(".env.local"), ...process.env };
const failures = [];

if (env.ENABLE_LIVE_PAYMENTS !== "false") failures.push("ENABLE_LIVE_PAYMENTS must be false");
if (env.ENABLE_AI_AUTOMATION !== "false") failures.push("ENABLE_AI_AUTOMATION must be false");
if (env.ENABLE_AUTO_PUBLICATION !== "false") failures.push("ENABLE_AUTO_PUBLICATION must be false");
if (env.PAYPAL_ENV !== "sandbox") failures.push("PAYPAL_ENV must be sandbox");

if (failures.length) {
  console.error("production:check FAIL", failures);
  process.exit(1);
}

console.log("production:check PASS: NO-GO_PRODUCTION controls are active");
