import { NextRequest, NextResponse } from 'next/server';
import { isIP } from 'net';
export const dynamic = 'force-dynamic';
const allowed = new Set([
  'auth',
  'users',
  'plans',
  'payments',
  'subscriptions',
  'vpn',
  'admin',
  'support',
]);
async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  if (
    !allowed.has(path[0]) ||
    path.some((p) => !/^[a-zA-Z0-9_-]+$/.test(p)) ||
    path.includes('webhook')
  )
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const mutation = !['GET', 'HEAD'].includes(req.method);
  if (mutation) {
    const expected = process.env.APP_URL || req.nextUrl.origin;
    if (req.headers.get('origin') !== expected)
      return NextResponse.json({ message: 'Недопустимый источник запроса' }, { status: 403 });
  }
  const route = path.join('/');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.TRUST_PROXY === '1') {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
    if (clientIp && isIP(clientIp)) headers['X-Forwarded-For'] = clientIp;
  }
  const token = req.cookies.get('appi_access')?.value;
  if (token) headers.Authorization = 'Bearer ' + token;
  const key = req.headers.get('idempotency-key');
  if (key) headers['Idempotency-Key'] = key;
  let body: string | undefined;
  if (mutation) body = await req.text();
  if ((body?.length || 0) > 32768)
    return NextResponse.json({ message: 'Запрос слишком большой' }, { status: 413 });
  if (route === 'auth/refresh')
    body = JSON.stringify({ refreshToken: req.cookies.get('appi_refresh')?.value || '' });
  try {
    const res = await fetch(
      (process.env.API_URL || 'http://127.0.0.1:3000/api').replace(/\/$/, '') +
        '/' +
        route +
        req.nextUrl.search,
      {
        method: req.method,
        headers,
        body: mutation ? body : undefined,
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(25000),
      },
    );
    const data = await res.json();
    const access = data?.accessToken,
      refresh = data?.refreshToken;
    if (access) delete data.accessToken;
    if (refresh) delete data.refreshToken;
    const response = NextResponse.json(data, {
      status: res.status,
      headers: { 'Cache-Control': 'no-store' },
    });
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: (process.env.APP_URL || '').startsWith('https://'),
      path: '/',
    };
    if (access && refresh && res.ok) {
      response.cookies.set('appi_access', access, { ...cookieOptions, maxAge: 3600 });
      response.cookies.set('appi_refresh', refresh, { ...cookieOptions, maxAge: 30 * 86400 });
    }
    if (route === 'auth/logout' || (route === 'auth/refresh' && res.status === 401)) {
      response.cookies.set('appi_access', '', { ...cookieOptions, maxAge: 0 });
      response.cookies.set('appi_refresh', '', { ...cookieOptions, maxAge: 0 });
    }
    return response;
  } catch {
    return NextResponse.json(
      { message: 'Сервер временно недоступен. Повторите попытку.' },
      { status: 503 },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
