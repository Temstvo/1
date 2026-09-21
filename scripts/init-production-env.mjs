import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
let template = await readFile(new URL('.env.production.example', root), 'utf8');
for (const key of ['POSTGRES_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET'])
  template = template.replace(
    new RegExp(`^${key}=.*$`, 'm'),
    `${key}=${randomBytes(32).toString('hex')}`,
  );
template = template.replace(
  /^VPN_ENCRYPTION_KEY=.*$/m,
  'VPN_ENCRYPTION_KEY=' + randomBytes(32).toString('base64'),
);
await writeFile(new URL('.env.production', root), template, { flag: 'wx', mode: 0o600 });
console.log(
  'Created private .env.production. Fill domain, providers and operator details before deployment. Existing files are never overwritten.',
);
