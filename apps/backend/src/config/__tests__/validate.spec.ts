import { validateEnvironment } from '../validate';
const base = {
  DATABASE_URL: 'postgresql://localhost/example',
  JWT_SECRET: 'a'.repeat(64),
  JWT_REFRESH_SECRET: 'b'.repeat(64),
};
describe('Pilot launch guards', () => {
  it('keeps the local guest preview available without payment providers', () => {
    expect(validateEnvironment({ ...base, ENABLE_GUEST_ACCESS: 'true' })).toBeTruthy();
  });
  it('rejects unbounded trials and enabling sales without managed VPN', () => {
    for (const v of ['0', '-1', 'NaN', '1000000', '1.5'])
      expect(() => validateEnvironment({ ...base, TRIAL_HOURS: v })).toThrow();
    expect(() => validateEnvironment({ ...base, ENABLE_CHECKOUT: 'true' })).toThrow('Marzban');
  });
  it('refuses shared imported credentials in production', () => {
    expect(() =>
      validateEnvironment({ ...base, NODE_ENV: 'production', ENABLE_IMPORTED_VPN_ACCESS: 'true' }),
    ).toThrow('Shared');
  });
});
