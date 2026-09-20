import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../token.service';
import { AuthService } from '../auth.service';
import { randomBytes, randomUUID } from 'crypto';
describe('Session token security', () => {
  const config = new ConfigService({
    JWT_SECRET: randomBytes(40).toString('hex'),
    JWT_REFRESH_SECRET: randomBytes(40).toString('hex'),
  });
  const jwt = new JwtService(),
    tokens = new TokenService(jwt, config);
  it('binds tokens to a session, randomizes them, separates access and refresh keys', async () => {
    const sid = randomUUID(),
      user = { id: randomUUID(), email: 'test@example.test', role: 'USER' };
    const a = await tokens.generateTokenPair(user, sid),
      b = await tokens.generateTokenPair(user, sid);
    expect(a.accessToken).not.toBe(b.accessToken);
    expect((await tokens.verifyRefreshToken(a.refreshToken)).sid).toBe(sid);
    await expect(tokens.verifyRefreshToken(a.accessToken)).rejects.toThrow();
    expect(jwt.verify(a.accessToken, { secret: config.get('JWT_SECRET') }).type).toBe('access');
  });
  it('disables guest creation by default before touching the database', async () => {
    const db = { user: { create: jest.fn() } };
    const auth = new AuthService(db as any, tokens, new ConfigService(), {} as any, {} as any);
    await expect(auth.guest()).rejects.toThrow('Гостевой доступ отключён');
    expect(db.user.create).not.toHaveBeenCalled();
  });
});
