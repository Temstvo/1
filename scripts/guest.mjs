// Local-only entry points. Never use these to start a public production service.
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2];
if (!['api', 'web'].includes(mode)) throw new Error('Usage: node scripts/guest.mjs api|web');
const cwd = resolve(root, 'apps', mode === 'api' ? 'backend' : 'frontend');
const env = { ...process.env };
if (mode === 'api') {
  env.NODE_ENV = 'development';
  env.PORT = '3100';
  env.ENABLE_GUEST_ACCESS = 'true';
  env.ENABLE_IMPORTED_VPN_ACCESS = 'true';
  env.SERV_CONFIGS_DIR = resolve(root, 'serv-configs');
  env.FRONTEND_URL = 'http://localhost:3001';
  env.BACKEND_URL = 'http://localhost:3100';
  env.CORS_ORIGINS = 'http://localhost:3001';
} else {
  env.API_URL = 'http://127.0.0.1:3100/api';
  env.APP_URL = 'http://localhost:3001';
}
const args =
  mode === 'api'
    ? ['dist/main.js']
    : ['node_modules/next/dist/bin/next', 'start', '-p', '3001', '-H', '127.0.0.1'];
const child = spawn(process.execPath, args, { cwd, env, stdio: 'inherit', windowsHide: true });
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code || 0;
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
