// Only connects to the isolated localhost cluster started by scripts/local-db.mjs.
const fs = require('node:fs');
const { Client } = require('../apps/backend/node_modules/pg');
async function main() {
  const s = JSON.parse(fs.readFileSync('.local/dev-secrets.json', 'utf8'));
  const client = new Client({ host: '127.0.0.1', port: 55432, user: 'appi', password: s.password, database: 'postgres' });
  await client.connect();
  for (const database of ['appi_vpn', 'appi_vpn_test']) {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [database]);
    if (!result.rowCount) await client.query('CREATE DATABASE ' + database);
  }
  await client.end();
  const env = [
    'NODE_ENV=development', 'PORT=3000', 'DATABASE_URL=postgresql://appi:' + s.password + '@127.0.0.1:55432/appi_vpn',
    'JWT_SECRET=' + s.jwt, 'JWT_REFRESH_SECRET=' + s.refresh, 'VPN_ENCRYPTION_KEY=' + s.encryption,
    'FRONTEND_URL=http://localhost:3001', 'BACKEND_URL=http://localhost:3000', 'CORS_ORIGINS=http://localhost:3001,http://127.0.0.1:3001',
  ].join('\n') + '\n';
  if (!fs.existsSync('apps/backend/.env')) fs.writeFileSync('apps/backend/.env', env, { mode: 0o600 });
  fs.writeFileSync('.local/test.env', env.replace('/appi_vpn\n', '/appi_vpn_test\n').replace('NODE_ENV=development', 'NODE_ENV=test'), { mode: 0o600 });
  console.log('Local development and test databases/env ready (credentials redacted).');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
