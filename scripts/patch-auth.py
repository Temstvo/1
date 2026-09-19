from pathlib import Path
p = Path('apps/backend/src/modules/auth/auth.service.ts')
s = p.read_text(encoding='utf8').replace("import { randomBytes }", "import { randomBytes, randomUUID }")
s = s.replace('this.tokenService.generateTokenPair(user)', 'this.issueSession(user, ip, userAgent)', 2)
start = s.index('    await this.prisma.session.create({', s.index('  async login('))
end = s.index('    await this.prisma.securityEvent.create({', start)
s = s[:start] + s[end:]
start = s.index('  async refresh(')
end = s.index('  async verifyEmail(', start)
s = s[:start] + '''  private async issueSession(user: User, ip = 'unknown', userAgent?: string, db: any = this.prisma) {
    const id = randomUUID();
    const tokens = await this.tokenService.generateTokenPair(user, id);
    const payload = await this.tokenService.verifyRefreshToken(tokens.refreshToken);
    await db.session.create({ data: {
      id, userId: user.id, tokenHash: this.tokenService.hashToken(tokens.accessToken),
      refreshTokenHash: this.tokenService.hashToken(tokens.refreshToken), ip, userAgent,
      expiresAt: new Date((payload as any).exp * 1000),
    }});
    return tokens;
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload.sid) throw new UnauthorizedException('Недействительная сессия');
    return this.prisma.$transaction(async tx => {
      const session = await tx.session.findFirst({ where: {
        id: payload.sid, userId: payload.sub, refreshTokenHash: this.tokenService.hashToken(refreshToken),
        isActive: true, expiresAt: { gt: new Date() },
      }});
      if (!session) throw new UnauthorizedException('Сессия истекла');
      const user = await tx.user.findUnique({ where: { id: payload.sub }, include: { profile: true } });
      if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('Аккаунт недоступен');
      const consumed = await tx.session.updateMany({ where: { id: session.id, isActive: true }, data: { isActive: false } });
      if (consumed.count !== 1) throw new UnauthorizedException('Токен уже использован');
      const tokens = await this.issueSession(user, session.ip, session.userAgent || undefined, tx);
      return { user: this.sanitizeUser(user), ...tokens };
    });
  }

''' + s[end:]
s = s.replace("user.status === 'BANNED' ||\n      user.status === 'SUSPENDED' ||", "user.status !== 'ACTIVE' ||")
p.write_text(s, encoding='utf8')
# OAuth had no state binding or verified-email linking; retire its unimplemented UI routes.
p = Path('apps/backend/src/modules/auth/auth.controller.ts')
s = p.read_text(encoding='utf8')
s = s[:s.index("  @Get('google')")] + '}\n'
s = s.replace("import { AuthService }", "import { Throttle } from '@nestjs/throttler';\nimport { AuthService }")
s = s.replace("@Controller('auth')", "@Controller('auth')\n@Throttle({ default: { limit: 20, ttl: 60000 } })")
p.write_text(s, encoding='utf8')
p = Path('apps/backend/src/modules/auth/auth.module.ts')
s = p.read_text(encoding='utf8')
a = s.index('const authProviders:'); b = s.index('@Module(', a)
s = s[:a] + s[b:]
s = s.replace('JwtStrategy, ...authProviders', 'JwtStrategy')
p.write_text(s, encoding='utf8')
