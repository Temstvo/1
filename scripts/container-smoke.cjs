// Executed inside the frontend container by Pilot CI. Uses its real BFF and backend.
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:3001';
async function main() {
  for (const path of ['/', '/app', '/guide', '/support', '/terms', '/privacy']) {
    assert.equal((await fetch(base + path)).status, 200, path);
  }
  const options = await (await fetch(base + '/api/payments/options')).json();
  assert.equal(options.enabled, false);
  const plans = await (await fetch(base + '/api/plans')).json();
  assert.equal(plans.length, 1);
  assert.equal(plans[0].name, 'Appi');
  const catalog = await (await fetch(base + '/api/vpn/imported/servers')).json();
  assert.equal(catalog.managed, true);
  assert.deepEqual(catalog.profiles, []);
  const guest = await fetch(base + '/api/auth/guest', {
    method: 'POST',
    headers: { Origin: process.env.APP_URL, 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(guest.status, 201);
  const payload = await guest.json();
  assert.equal(payload.user.role, 'USER');
  assert.equal(payload.accessToken, undefined);
  assert.equal(payload.refreshToken, undefined);
  const cookies = guest.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  for (const cookie of cookies) {
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.match(cookie, /SameSite=lax/i);
  }
  const cookie = cookies.map((v) => v.split(';')[0]).join('; ');
  const me = await fetch(base + '/api/users/me', { headers: { Cookie: cookie } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).id, payload.user.id);
  const rejected = await fetch(base + '/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: cookie, Origin: 'https://wrong.example.test' },
  });
  assert.equal(rejected.status, 403);
  const privateConfig = await fetch(base + '/api/vpn/configs', { headers: { Cookie: cookie } });
  assert.equal(privateConfig.status, 403);
  console.log(
    'Container smoke passed: pages, one plan, managed catalog, guest BFF cookies, identity, CSRF, no unpaid VPN.',
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
