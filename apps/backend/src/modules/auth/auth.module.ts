import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TelegramModule } from '../telegram/telegram.module';

const authProviders: any[] = [];

if (process.env.GOOGLE_CLIENT_ID) {
  const { GoogleStrategy } = require('./strategies/google.strategy');
  authProviders.push(GoogleStrategy);
}
if (process.env.GITHUB_CLIENT_ID) {
  const { GitHubStrategy } = require('./strategies/github.strategy');
  authProviders.push(GitHubStrategy);
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TelegramModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy, ...authProviders],
  exports: [AuthService, TokenService, JwtModule],
})
export class AuthModule {}
