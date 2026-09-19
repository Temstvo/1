import EmbeddedPostgres from 'embedded-postgres';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
await mkdir('.local', { recursive: true });
let secrets;
try { secrets = JSON.parse(await readFile('.local/dev-secrets.json', 'utf8')); }
catch { secrets = { password: randomBytes(24).toString('hex'), jwt: randomBytes(40).toString('hex'), refresh: randomBytes(40).toString('hex'), encryption: randomBytes(32).toString('base64') }; await writeFile('.local/dev-secrets.json', JSON.stringify(secrets), { mode: 0o600 }); }
const pg = new EmbeddedPostgres({
  databaseDir: resolve('.local/postgres'), user: 'appi', password: secrets.password, port: 55432,
  persistent: true, authMethod: 'scram-sha-256', initdbFlags: ['--encoding=UTF8', '--locale=C'],
  postgresFlags: ['-c', 'listen_addresses=127.0.0.1'], onLog: () => {}, onError: m => { if (String(m).includes('FATAL')) console.error(m); },
});
try { await readFile('.local/postgres/PG_VERSION'); } catch { await pg.initialise(); }
await pg.start();
const client = pg.getPgClient(); await client.connect();
for (const database of ['appi_vpn', 'appi_vpn_test']) {
  const result = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [database]);
  if (!result.rowCount) await client.query('CREATE DATABASE ' + database);
}
await client.end();
const env = [
  'NODE_ENV=development', 'PORT=3000', 'DATABASE_URL=postgresql://appi:' + secrets.password + '@127.0.0.1:55432/appi_vpn',
  'JWT_SECRET=' + secrets.jwt, 'JWT_REFRESH_SECRET=' + secrets.refresh, 'VPN_ENCRYPTION_KEY=' + secrets.encryption,
  'FRONTEND_URL=http://localhost:3001', 'BACKEND_URL=http://localhost:3000', 'CORS_ORIGINS=http://localhost:3001,http://127.0.0.1:3001',
].join('\n') + '\n';
try { await readFile('apps/backend/.env'); } catch { await writeFile('apps/backend/.env', env, { mode: 0o600 }); }
await writeFile('.local/test.env', env.replace('/appi_vpn\n', '/appi_vpn_test\n').replace('NODE_ENV=development', 'NODE_ENV=test'), { mode: 0o600 });
console.log('Isolated PostgreSQL listening on 127.0.0.1:55432. Development env saved only if absent.');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await pg.stop(); process.exit(0); });
setInterval(() => {}, 60000);
