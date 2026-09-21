require('dotenv/config');
async function main() {
  const {
    MARZBAN_URL: base,
    MARZBAN_USERNAME: username,
    MARZBAN_PASSWORD: password,
    MARZBAN_INBOUND_TAG: tag,
  } = process.env;
  if (!base || !username || !password || !tag)
    throw new Error('Configure all MARZBAN_* fields first');
  const origin = new URL(base);
  if (origin.protocol !== 'https:' || origin.username || origin.password)
    throw new Error('Use a clean HTTPS Marzban URL');
  const login = await fetch(new URL('/api/admin/token', origin), {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
  });
  if (!login.ok) throw new Error('Marzban authentication failed');
  const token = (await login.json()).access_token;
  if (!token) throw new Error('Marzban returned no token');
  const response = await fetch(new URL('/api/inbounds', origin), {
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!response.ok) throw new Error('Cannot read Marzban inbounds');
  const inbound = (await response.json()).vless?.find((v) => v.tag === tag);
  if (!inbound) throw new Error('Selected VLESS inbound was not found');
  console.log(
    'Marzban authentication and selected VLESS inbound: OK. This is not a VPN tunnel test.',
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
