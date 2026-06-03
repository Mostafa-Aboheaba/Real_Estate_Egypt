import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../../application/auth/auth.service';
import { AUTH_REPOSITORY } from '../../domain/auth/ports/auth.repository.port';
import { TOKEN_SERVICE } from '../../domain/auth/ports/token.service.port';
import { AppleIdTokenVerifier } from '../../infrastructure/auth/apple-id-token.verifier';
import { EmailService } from '../../infrastructure/auth/email.service';
import { GoogleIdTokenVerifier } from '../../infrastructure/auth/google-id-token.verifier';
import { JwtTokenService } from '../../infrastructure/auth/jwt-token.service';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { PrismaAuthRepository } from '../../infrastructure/persistence/auth/prisma-auth.repository';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<number>('jwt.accessExpiresSec', 900),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    EmailService,
    GoogleIdTokenVerifier,
    AppleIdTokenVerifier,
    { provide: AUTH_REPOSITORY, useClass: PrismaAuthRepository },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    TOKEN_SERVICE,
    AUTH_REPOSITORY,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
