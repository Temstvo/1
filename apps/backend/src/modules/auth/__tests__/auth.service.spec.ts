import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../email/email.service';
import { TelegramNotifyService } from '../../telegram/telegram-notify.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let tokenService: jest.Mocked<TokenService>;

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    passwordHash: '$argon2id$...',
    role: 'USER' as const,
    status: 'ACTIVE' as const,
    emailVerified: false,
    referralCode: 'ABC12345',
    loginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    lastLoginIp: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      id: 'profile-id-1',
      userId: 'user-id-1',
      firstName: 'Test',
      lastName: 'User',
      language: 'en',
      timezone: 'UTC',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TelegramNotifyService,
          useValue: { sendAdmin: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findFirst: jest.fn(),
            },
            session: {
              create: jest.fn(),
              findFirst: jest.fn(() => ({
                id: 'session-1',
                ip: '10.0.0.1',
                userAgent: 'jest',
                isActive: true,
              })),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            securityEvent: {
              create: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
            referral: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: TokenService,
          useValue: {
            hashPassword: jest.fn(),
            verifyPassword: jest.fn(),
            generateTokenPair: jest.fn(),
            generateEmailVerificationToken: jest.fn(),
            hashToken: jest.fn(),
            generatePasswordResetToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
            sendVerificationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    tokenService = module.get(TokenService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      tokenService.hashPassword.mockResolvedValue('hashed-password');
      tokenService.generateEmailVerificationToken.mockReturnValue('verification-token');
      tokenService.hashToken.mockReturnValue('hashed-token');
      prismaService.user.create.mockResolvedValue(mockUser as any);
      tokenService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'Test123!@',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw on duplicate email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Test123!@',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      tokenService.verifyPassword.mockResolvedValue(true);
      tokenService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'Test123!@',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw on invalid credentials', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      tokenService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'Test123!@',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({
        sub: 'user-id-1',
        email: 'test@example.com',
        role: 'USER',
        type: 'refresh',
      });
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      tokenService.generateTokenPair.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await service.refresh('refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });
  });
});
