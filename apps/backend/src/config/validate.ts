export function validateEnvironment(env: Record<string, unknown>) {
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    if (typeof env[key] !== 'string' || !env[key]) throw new Error(`${key} is required`);
  }
  for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    if (String(env[key]).length < 32) throw new Error(`${key} must contain at least 32 characters`);
  }
  if (env.JWT_SECRET === env.JWT_REFRESH_SECRET) throw new Error('JWT secrets must differ');
  if (env.NODE_ENV === 'production') {
    for (const key of ['FRONTEND_URL', 'BACKEND_URL']) {
      if (!String(env[key] || '').startsWith('https://')) throw new Error(`${key} must use HTTPS`);
    }
    if (!env.CORS_ORIGINS || String(env.CORS_ORIGINS).includes('*'))
      throw new Error('Explicit CORS_ORIGINS required');
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
