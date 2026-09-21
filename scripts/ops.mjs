import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, stat, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const command = process.argv[2];
const compose = ['compose', '--env-file', '.env.production', '-f', 'docker-compose.prod.yml'];
async function run(args, input, output) {
  const child = spawn('docker', [...compose, ...args], {
    cwd: root,
    stdio: [input ? 'pipe' : 'inherit', output ? 'pipe' : 'inherit', 'inherit'],
  });
  const finished = new Promise((done, reject) => {
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? done() : reject(new Error(`Docker exited with ${code}`)),
    );
  });
  await Promise.all([
    finished,
    ...(input ? [pipeline(createReadStream(input), child.stdin)] : []),
    ...(output
      ? [pipeline(child.stdout, createWriteStream(output, { flags: 'wx', mode: 0o600 }))]
      : []),
  ]);
}
const execDb = (...args) => ['exec', '-T', 'postgres', ...args];
try {
  if (command === 'deploy') {
    await run(['config', '--quiet']);
    await run(['build', 'backend', 'frontend']);
    await run(['up', '-d', 'postgres']);
    await run(['run', '--rm', 'migrate']);
    await run(['up', '-d', '--wait', 'backend', 'frontend', 'caddy']);
    console.log(
      'Containers ready. Complete the external HTTPS, payment and device checks before enabling sales.',
    );
  } else if (command === 'backup') {
    await mkdir(resolve(root, 'backups'), { recursive: true, mode: 0o700 });
    const target = resolve(
      root,
      'backups',
      `appi-${new Date().toISOString().replace(/[:.]/g, '-')}.dump`,
    );
    await run(execDb('pg_dump', '-U', 'appi', '-d', 'appi', '-Fc'), undefined, target + '.partial');
    if ((await stat(target + '.partial')).size < 100)
      throw new Error('Backup is unexpectedly small');
    await rename(target + '.partial', target);
    console.log(`Backup complete: ${target}. Copy it to your protected off-host storage.`);
  } else if (command === 'verify-backup') {
    const file = resolve(process.argv[3] || '');
    if (!(await stat(file)).isFile()) throw new Error('Supply a backup file');
    const db = 'appi_restore_check_' + Date.now();
    await run(execDb('createdb', '-U', 'appi', db));
    try {
      await run(
        execDb(
          'pg_restore',
          '-U',
          'appi',
          '-d',
          db,
          '--exit-on-error',
          '--single-transaction',
          '--no-owner',
        ),
        file,
      );
      await run(
        execDb(
          'psql',
          '-U',
          'appi',
          '-d',
          db,
          '-v',
          'ON_ERROR_STOP=1',
          '-c',
          'SELECT count(*) AS migrations FROM _prisma_migrations; SELECT count(*) AS users FROM users; SELECT count(*) AS payments FROM payments;',
        ),
      );
      console.log('Backup restored and queried successfully in an isolated database.');
    } finally {
      await run(execDb('dropdb', '-U', 'appi', db));
    }
  } else if (command === 'restore') {
    if (process.argv[4] !== '--confirm-replace-appi')
      throw new Error(
        'Restoring replaces production data. Usage: node scripts/ops.mjs restore FILE --confirm-replace-appi',
      );
    const file = resolve(process.argv[3]);
    await stat(file);
    await run(['stop', 'backend']);
    await run(
      execDb(
        'pg_restore',
        '-U',
        'appi',
        '-d',
        'appi',
        '--clean',
        '--if-exists',
        '--exit-on-error',
        '--single-transaction',
        '--no-owner',
      ),
      file,
    );
    await run(['run', '--rm', 'migrate']);
    await run(['up', '-d', '--wait', 'backend']);
  } else if (command === 'status') {
    await run(['ps']);
    await run(['exec', '-T', 'backend', 'node', 'scripts/readiness.cjs']);
  } else if (command === 'pilot-plan') {
    await run(['exec', '-T', 'backend', 'node', 'scripts/pilot-plan.cjs']);
  } else if (command === 'probe-vpn') {
    await run(['exec', '-T', 'backend', 'node', 'scripts/probe-vpn.cjs']);
  } else
    throw new Error(
      'Commands: deploy | pilot-plan | probe-vpn | backup | verify-backup FILE | restore FILE --confirm-replace-appi | status',
    );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
