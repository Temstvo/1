"""Report locations only; never print suspected credential values."""
import pathlib, re, subprocess

root = pathlib.Path(__file__).resolve().parents[1]
patterns = {
    'telegram token': r'\b\d{8,12}:[A-Za-z0-9_-]{30,}',
    'private key': r'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----',
    'credential URL': r'postgres(?:ql)?://[^\s\x22\x27]+',
    'secret assignment': r'(?i)(?:JWT_SECRET|JWT_REFRESH_SECRET|TELEGRAM_BOT_TOKEN|RESEND_API_KEY|SECRET_KEY)\s*=\s*[^\s]+',
}
for name in subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0'):
    p = root / name
    if not name or not p.is_file() or p.suffix in ['.png', '.ico', '.jpg', '.lock']: continue
    for n, line in enumerate(p.read_text(encoding='utf8', errors='ignore').splitlines(), 1):
        for label, pattern in patterns.items():
            if re.search(pattern, line): print(f'{name}:{n}: {label} [redacted; inspect locally]')
