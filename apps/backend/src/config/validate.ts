export function validateEnvironment(env: Record<string, unknown>) {
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    if (typeof env[key] !== 'string' || !env[key]) throw new Error(`${key} is required`);
  }
  for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    if (String(env[key]).length < 32) throw new Error(`${key} must contain at least 32 characters`);
  }
  if (env.JWT_SECRET === env.JWT_REFRESH_SECRET) throw new Error('JWT secrets must differ');
  if (env.NODE_ENV === 'production') {
    for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
      if (/CHANGE_ME|test_|example/i.test(String(env[key])))
        throw new Error(`${key} contains a placeholder`);
    }
    if (env.ENABLE_IMPORTED_VPN_ACCESS === 'true')
      throw new Error('Shared imported credentials cannot be exported in production');
    for (const key of ['FRONTEND_URL', 'BACKEND_URL']) {
      if (!String(env[key] || '').startsWith('https://')) throw new Error(`${key} must use HTTPS`);
    }
    if (!env.CORS_ORIGINS || String(env.CORS_ORIGINS).includes('*'))
      throw new Error('Explicit CORS_ORIGINS required');
  }
  for (const [key, fallback, max] of [
    ['TRIAL_HOURS', 24, 72],
    ['TRIAL_TRAFFIC_GB', 1, 10],
    ['TRIAL_DAILY_LIMIT', 50, 1000],
  ] as const) {
    const n = Number(env[key] ?? fallback);
    if (!Number.isInteger(n) || n < 1 || n > max) throw new Error(`${key} is out of bounds`);
  }
  if (env.ENABLE_CHECKOUT === 'true' || env.ENABLE_VPN_TRIAL === 'true') {
    if (!env.MARZBAN_URL) throw new Error('Managed Marzban is required for sales/trials');
    if (env.NODE_ENV === 'production' && (!env.RESEND_API_KEY || !env.EMAIL_FROM))
      throw new Error('Email delivery is required for sales/trials');
  }
  if (env.ENABLE_CHECKOUT === 'true' && env.NODE_ENV === 'production') {
    for (const key of [
      'YOOKASSA_SHOP_ID',
      'YOOKASSA_SECRET_KEY',
      'SUPPORT_EMAIL',
      'OPERATOR_NAME',
      'OPERATOR_DETAILS',
    ])
      if (!env[key]) throw new Error(`${key} is required before opening checkout`);
    if (!['true', 'false'].includes(String(env.YOOKASSA_TEST_MODE)))
      throw new Error('Set YOOKASSA_TEST_MODE explicitly');
  }
  if (env.MARZBAN_URL) {
    const url = new URL(String(env.MARZBAN_URL));
    if (url.username || url.password || !['https:', 'http:'].includes(url.protocol))
      throw new Error('Invalid MARZBAN_URL');
    if (env.NODE_ENV === 'production' && url.protocol !== 'https:')
      throw new Error('MARZBAN_URL must use HTTPS');
    if (Buffer.from(String(env.VPN_ENCRYPTION_KEY || ''), 'base64').length !== 32)
      throw new Error('VPN_ENCRYPTION_KEY must be 32 bytes in base64');
    if (!env.MARZBAN_USERNAME || !env.MARZBAN_PASSWORD || !env.MARZBAN_INBOUND_TAG)
      throw new Error('Marzban credentials and inbound tag required');
  }
  return env;
}
