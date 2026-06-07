import fs from 'node:fs';

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'AUTHORIZED_STAGING_TARGET',
  'PRODUCTION_STATUS',
  'SUPABASE_ACCESS_TOKEN',
];

const text = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const map = new Map();
for (const rawLine of text.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;
  const eq = line.indexOf('=');
  if (eq === -1) continue;
  const key = line.slice(0, eq).trim();
  const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
  map.set(key, value);
}

for (const key of required) {
  const present = map.has(key) && String(map.get(key)).length > 0;
  console.log(`${key}=${present ? 'SET' : 'MISSING'}`);
}

console.log(`SUPABASE_URL_MATCH=${map.get('SUPABASE_URL') === 'https://ngliugfcwydnfbpalkpb.supabase.co' ? 'YES' : 'NO'}`);
console.log(`NEXT_PUBLIC_SUPABASE_URL_MATCH=${map.get('NEXT_PUBLIC_SUPABASE_URL') === 'https://ngliugfcwydnfbpalkpb.supabase.co' ? 'YES' : 'NO'}`);
console.log(`AUTHORIZED_STAGING_TARGET_OK=${map.get('AUTHORIZED_STAGING_TARGET') === 'true' ? 'YES' : 'NO'}`);
console.log(`PRODUCTION_STATUS_OK=${map.get('PRODUCTION_STATUS') === 'NO-GO_PRODUCTION' ? 'YES' : 'NO'}`);
