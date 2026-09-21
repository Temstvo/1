import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { lockUser } from '../../database/lock-user';
import { TokenService } from './token.service';
import { EmailService } from '../email/email.service';
import { TelegramNotifyService } from '../telegram/telegram-notify.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '@prisma/client';
import { randomBytes, randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private configService: ConfigService,
    private emailService: EmailService,
    private telegramNotify: TelegramNotifyService,
  ) {}

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email уже зарегистрирован');
    }

    const passwordHash = await this.tokenService.hashPassword(dto.password);
    const emailVerificationToken = this.tokenService.generateEmailVerificationToken();
    const emailVerificationTokenHash = this.tokenService.hashToken(emailVerificationToken);
    const referralCode = this.generateReferralCode();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        referralCode,
        emailVerified: false,
        emailVerificationTokenHash,
        emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
    });

    if (dto.referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: dto.referralCode },
      });

      if (referrer && referrer.id !== user.id) {
        await this.prisma.referral.create({
          data: {
            ownerId: referrer.id,
            userId: user.id,
          },
        });
      }
    }

    void Promise.resolve(
      this.prisma.securityEvent.create({
        data: {
          userId: user.id,
          type: 'USER_CREATED',
          ip,
          userAgent,
        },
      }),
    ).catch((e) => this.logger.warn(`securityEvent failed: ${e?.message?.split('\n')[0]}`));

    void Promise.resolve(
      this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'REGISTER',
          resource: 'USER',
          resourceId: user.id,
          ip,
          userAgent,
          result: 'success',
        },
      }),
    ).catch((e) => this.logger.warn(`auditLog failed: ${e?.message?.split('\n')[0]}`));

    const tokens = await this.issueSession(user, ip, userAgent);

    await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

    this.logger.log(`User registered: ${user.email}`);

    void this.telegramNotify.sendAdmin(
      [
        'Новая регистрация',
        `Имя: ${dto.firstName ?? '—'} ${dto.lastName ?? ''}`.trim(),
        `Email: ${user.email}`,
        `Дата: ${new Date().toLocaleString('ru-RU')}`,
        `Реферальный код: ${referralCode}`,
      ].join('\n'),
    );

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async guest(ip?: string, userAgent?: string) {
    if (this.configService.get('ENABLE_GUEST_ACCESS') !== 'true') {
      throw new UnauthorizedException('Гостевой доступ отключён');
    }
    const user = await this.prisma.user.create({
      data: {
        email: `guest-${randomUUID()}@guest.invalid`,
        referralCode: this.generateReferralCode(),
        profile: { create: { firstName: 'Гость' } },
      },
    });
    const tokens = await this.issueSession(user, ip, userAgent);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async claimGuest(id: string, dto: RegisterDto) {
    const passwordHash = await this.tokenService.hashPassword(dto.password);
    const token = this.tokenService.generateEmailVerificationToken();
    const user = await this.prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id, email: { endsWith: '@guest.invalid' }, passwordHash: null, status: 'ACTIVE' },
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          emailVerified: false,
          emailVerificationTokenHash: this.tokenService.hashToken(token),
          emailVerificationExpiresAt: new Date(Date.now() + 86400000),
        },
      });
      if (changed.count !== 1) throw new ConflictException('Этот аккаунт уже сохранён');
      await tx.profile.upsert({
        where: { userId: id },
        create: { userId: id, firstName: dto.firstName, lastName: dto.lastName },
        update: { firstName: dto.firstName, lastName: dto.lastName },
      });
      return tx.user.findUniqueOrThrow({ where: { id } });
    });
    await this.emailService.sendVerificationEmail(user.email, token);
    return { user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (user.status !== 'ACTIVE' || (user.lockedUntil && user.lockedUntil > new Date())) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isValidPassword = await this.tokenService.verifyPassword(user.passwordHash, dto.password);

    if (!isValidPassword) {
      const failed = await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: { increment: 1 } },
      });
      const attempts = failed.loginAttempts;
      if (attempts >= 5)
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
        });

      await this.prisma.securityEvent.create({
        data: {
          userId: user.id,
          type: 'LOGIN_FAILURE',
          ip,
          userAgent,
          metadata: { attempts },
        },
      });

      if (attempts >= 5) {
        this.logger.warn(`Account locked due to brute force: ${user.email}`);
      }

      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.issueSession(user, ip, userAgent);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: 'LOGIN_SUCCESS',
        ip,
        userAgent,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'LOGIN',
        resource: 'USER',
        resourceId: user.id,
        ip,
        userAgent,
        result: 'success',
      },
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: string, tokenHash: string, ip?: string) {
    await this.prisma.session.updateMany({
      where: {
        userId,
        tokenHash,
      },
      data: {
        isActive: false,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'LOGOUT',
        resource: 'USER',
        resourceId: userId,
        ip,
        result: 'success',
      },
    });

    this.logger.log(`User logged out: ${userId}`);
  }

  private async issueSession(
    user: User,
    ip = 'unknown',
    userAgent?: string,
    db: any = this.prisma,
  ) {
    const id = randomUUID();
    const tokens = await this.tokenService.generateTokenPair(user, id);
    const payload = await this.tokenService.verifyRefreshToken(tokens.refreshToken);
    await db.session.create({
      data: {
        id,
        userId: user.id,
        tokenHash: this.tokenService.hashToken(tokens.accessToken),
        refreshTokenHash: this.tokenService.hashToken(tokens.refreshToken),
        ip,
        userAgent,
        expiresAt: new Date((payload as any).exp * 1000),
      },
    });
    return tokens;
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload.sid) throw new UnauthorizedException('Недействительная сессия');
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findFirst({
        where: {
          id: payload.sid,
          userId: payload.sub,
          refreshTokenHash: this.tokenService.hashToken(refreshToken),
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });
      if (!session) throw new UnauthorizedException('Сессия истекла');
      const user = await tx.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });
      if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('Аккаунт недоступен');
      const consumed = await tx.session.updateMany({
        where: { id: session.id, isActive: true },
        data: { isActive: false },
      });
      if (consumed.count !== 1) throw new UnauthorizedException('Токен уже использован');
      const tokens = await this.issueSession(user, session.ip, session.userAgent || undefined, tx);
      return { user: this.sanitizeUser(user), ...tokens };
    });
  }

  async verifyEmail(token: string) {
    const tokenHash = this.tokenService.hashToken(token);

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerified: false,
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Недействительный токен подтверждения');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'EMAIL_VERIFIED',
        resource: 'USER',
        resourceId: user.id,
        result: 'success',
      },
    });

    this.logger.log(`Email verified: ${user.email}`);
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.emailVerified) return { message: 'Email уже подтверждён' };
    if (user.email.endsWith('@guest.invalid'))
      throw new ConflictException('Сначала сохраните аккаунт');
    const token = this.tokenService.generateEmailVerificationToken();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationTokenHash: this.tokenService.hashToken(token),
        emailVerificationExpiresAt: new Date(Date.now() + 86400000),
      },
    });
    const delivered = await this.emailService.sendVerificationEmail(user.email, token);
    return {
      message: delivered
        ? 'Письмо отправлено'
        : 'Письмо не отправлено. Повторите позже или обратитесь в поддержку.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.status !== 'ACTIVE' || user.email.endsWith('@guest.invalid')) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = this.tokenService.generatePasswordResetToken();
    const resetTokenHash = this.tokenService.hashToken(resetToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: resetTokenHash,
        passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    this.logger.log(`Password reset requested for: ${user.email}`);

    return {
      message: 'If the email exists, a reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.tokenService.hashToken(token);

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Недействительный или истёкший токен сброса');
    }

    const passwordHash = await this.tokenService.hashPassword(newPassword);

    await this.prisma.$transaction(async (tx) => {
      await lockUser(tx, user.id);
      const changed = await tx.user.updateMany({
        where: {
          id: user.id,
          status: 'ACTIVE',
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: { gt: new Date() },
        },
        data: {
          passwordHash,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
          loginAttempts: 0,
          lockedUntil: null,
        },
      });
      if (changed.count !== 1)
        throw new UnauthorizedException('Ссылка уже использована или истекла');
      await tx.session.updateMany({ where: { userId: user.id }, data: { isActive: false } });
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'PASSWORD_RESET',
        resource: 'USER',
        resourceId: user.id,
        result: 'success',
      },
    });

    this.logger.log(`Password reset completed for: ${user.email}`);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const isValid = await this.tokenService.verifyPassword(user.passwordHash, currentPassword);

    if (!isValid) {
      throw new UnauthorizedException('Текущий пароль неверный');
    }

    const passwordHash = await this.tokenService.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'PASSWORD_CHANGED',
        resource: 'USER',
        resourceId: userId,
        result: 'success',
      },
    });

    this.logger.log(`Password changed for user: ${userId}`);
  }

  async validateOAuthUser(profile: {
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    provider: string;
    providerId: string;
  }) {
    let user: User | null = await this.prisma.user.findUnique({
      where: { email: profile.email.toLowerCase() },
      include: { profile: true },
    });

    if (user) {
      const tokens = await this.tokenService.generateTokenPair(user);
      return {
        user: this.sanitizeUser(user),
        ...tokens,
        isNewUser: false,
      };
    }

    const referralCode = this.generateReferralCode();

    user = await this.prisma.user.create({
      data: {
        email: profile.email.toLowerCase(),
        emailVerified: true,
        referralCode,
        profile: {
          create: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatar: profile.avatar,
          },
        },
      },
    });

    const tokens = await this.tokenService.generateTokenPair(user);

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'OAUTH_REGISTER',
        resource: 'USER',
        resourceId: user.id,
        metadata: { provider: profile.provider },
        result: 'success',
      },
    });

    this.logger.log(`OAuth user created: ${user.email} via ${profile.provider}`);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      isNewUser: true,
    };
  }

  private sanitizeUser(user: User) {
    const {
      passwordHash,
      twoFactorSecret,
      emailVerificationTokenHash,
      passwordResetTokenHash,
      ...sanitized
    } = user as any;
    return sanitized;
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(bytes[i] % chars.length);
    }
    return code;
  }
}
