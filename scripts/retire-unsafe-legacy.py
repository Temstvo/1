"""One-time source cleanup after the audit; paths are limited to this checkout."""
from pathlib import Path
root = Path.cwd().resolve()
paths = [
  'apps/backend/src/modules/vpn/node-registry.service.ts',
  'apps/backend/src/modules/vpn/connections.controller.ts',
  'apps/backend/src/modules/vpn/connections.service.ts',
  'apps/backend/src/modules/vpn/health-check.service.ts',
  'apps/backend/src/modules/vpn/migration.service.ts',
  'apps/backend/src/modules/vpn/privacy-check.service.ts',
  'apps/backend/src/modules/vpn/vpn-config-scheduler.ts',
  'apps/backend/src/modules/vpn/vpn-config-sync.service.ts',
  'apps/backend/src/modules/vpn/vpn-configs.module.ts',
  'apps/backend/src/modules/vpn/vpn-configs.controller.ts',
  'apps/backend/src/modules/vpn/vpn-config.service.ts',
  'apps/backend/src/database/robust-pg.adapter.ts',
  'apps/backend/src/modules/payments/providers/cryptomus.service.ts',
  'apps/backend/src/modules/payments/providers/telegram-wallet.service.ts',
]
for folder in ['apps/backend/src/modules/sub', 'apps/backend/src/modules/growth']:
    paths += [str(p.relative_to(root)) for p in (root / folder).glob('*.ts')]
for folder in ['serv-configs']:
    paths += [str(p.relative_to(root)) for p in (root / folder).rglob('*.json')]
for name in paths:
    p = (root / name).resolve()
    assert p.is_relative_to(root)
    if p.is_file(): p.unlink()
# Never keep deployment secrets in tracked env examples.
for name in ['.env.development', '.env.production', '.env.oracle.example']:
    p = root / name
    if p.exists(): p.unlink()
# Runtime code must not log bearer links or query tokens.
p = root / 'apps/backend/src/common/middleware/request-logger.middleware.ts'
s = p.read_text(encoding='utf8').replace('const start = Date.now();', "const safePath = originalUrl.split('?')[0].replace(/(\\/sub\\/)[^/]+/, '$1[redacted]');\n    const start = Date.now();")
s = s.replace('${originalUrl}', '${safePath}')
p.write_text(s, encoding='utf8')
p = root / 'apps/backend/src/common/filters/global-exception.filter.ts'
s = p.read_text(encoding='utf8').replace('${request.url}', "${request.path.replace(/(\\/sub\\/)[^/]+/, '$1[redacted]')}")
s = s.replace("exception instanceof Error ? exception.stack : '',", "exception instanceof Error ? exception.name : '',")
p.write_text(s, encoding='utf8')
