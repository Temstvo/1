import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { TokenService } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
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
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
      include: {
        profile: true,
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
        action: 'REGISTER',
        resource: 'USER',
        resourceId: user.id,
        ip,
        userAgent,
        result: 'success',
      },
    });

    const tokens = await this.tokenService.generateTokenPair(user);

    this.logger.log(`User registered: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      emailVerificationToken,
    };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Account has been banned');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account has been suspended');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    const isValidPassword = await this.tokenService.verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!isValidPassword) {
      const attempts = user.loginAttempts + 1;
      const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: lockUntil,
        },
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

      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.tokenService.generateTokenPair(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: this.tokenService.hashToken(tokens.accessToken),
        ip: ip || 'unknown',
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account is not available');
    }

    const tokens = await this.tokenService.generateTokenPair(user);

    await this.prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: 'TOKEN_REFRESH',
      },
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.tokenService.hashToken(token);

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerified: false,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = this.tokenService.generatePasswordResetToken();
    const resetTokenHash = this.tokenService.hashToken(resetToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: resetTokenHash,
      },
    });

    this.logger.log(`Password reset requested for: ${user.email}`);

    return {
      message: 'If the email exists, a reset link has been sent',
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.tokenService.hashToken(token);

    const user = await this.prisma.user.findFirst({
      where: {
        twoFactorSecret: tokenHash,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await this.tokenService.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        twoFactorSecret: null,
      },
    });

    await this.prisma.session.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
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
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.tokenService.verifyPassword(
      user.passwordHash,
      currentPassword,
    );

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
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
    let user = await this.prisma.user.findUnique({
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
      include: { profile: true },
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
    const { passwordHash, twoFactorSecret, ...sanitized } = user as any;
    return sanitized;
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
