jest.mock('../../infrastructure/auth/apple-id-token.verifier', () => ({
  AppleIdTokenVerifier: class {
    verify = jest.fn();
  },
}));
jest.mock('../../infrastructure/auth/google-id-token.verifier', () => ({
  GoogleIdTokenVerifier: class {
    verify = jest.fn();
  },
}));

import { AuthService } from './auth.service';
import { AuthErrorCode } from '../../domain/auth/failures/auth.failures';
import { AUTH_REPOSITORY } from '../../domain/auth/ports/auth.repository.port';
import { TOKEN_SERVICE } from '../../domain/auth/ports/token.service.port';
import { PASSWORD_HASHER } from '../../domain/auth/ports/password-hasher.port';
import { EMAIL_SENDER } from '../../domain/auth/ports/email-sender.port';
import { OAUTH_VERIFIER } from '../../domain/auth/ports/oauth-verifier.port';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  const repo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    saveEmailVerificationToken: jest.fn(),
    findById: jest.fn(),
    updatePassword: jest.fn(),
    saveRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllRefreshTokens: jest.fn(),
    consumeEmailVerificationToken: jest.fn(),
    savePasswordResetToken: jest.fn(),
    consumePasswordResetToken: jest.fn(),
    linkOAuthAccount: jest.fn(),
    findByOAuth: jest.fn(),
    findProfileById: jest.fn(),
    markEmailVerified: jest.fn(),
  };

  const tokens = {
    issueTokenPair: jest.fn(),
    verifyAccessToken: jest.fn(),
  };

  const passwords = { hash: jest.fn(), compare: jest.fn() };
  const emailSender = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };
  const oauthVerifier = { verify: jest.fn() };

  const config = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'auth.devAutoVerifyEmail') {
        return false;
      }
      return defaultValue;
    }),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      repo as never,
      tokens as never,
      passwords as never,
      emailSender as never,
      oauthVerifier as never,
      config as unknown as ConfigService,
    );
  });

  it('rejects register without consent', async () => {
    await expect(
      service.register({
        email: 'a@b.com',
        password: 'password1',
        role: 'buyer',
        locale: 'en',
        consentAccepted: false,
      }),
    ).rejects.toMatchObject({ code: AuthErrorCode.CONSENT_REQUIRED });
  });

  it('rejects duplicate email on register', async () => {
    repo.findByEmail.mockResolvedValue({ id: '1', email: 'a@b.com' });
    await expect(
      service.register({
        email: 'a@b.com',
        password: 'password1',
        role: 'buyer',
        locale: 'en',
        consentAccepted: true,
      }),
    ).rejects.toMatchObject({ code: AuthErrorCode.DUPLICATE_EMAIL });
  });

  it('registers a new user and sends verification email', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.createUser.mockResolvedValue({
      id: 'u1',
      email: 'new@example.com',
      role: UserRole.Buyer,
      emailVerified: false,
    });
    passwords.hash.mockResolvedValue('hash');

    const result = await service.register({
      email: 'new@example.com',
      password: 'password1',
      role: 'buyer',
      locale: 'en',
      consentAccepted: true,
    });

    expect(result.email).toBe('new@example.com');
    expect(emailSender.sendVerificationEmail).toHaveBeenCalled();
    expect(repo.saveEmailVerificationToken).toHaveBeenCalled();
  });

  it('rejects login when email is not verified', async () => {
    repo.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash: 'hash',
      emailVerified: false,
      role: UserRole.Buyer,
      locale: 'en',
      name: null,
    });
    passwords.compare.mockResolvedValue(true);

    await expect(service.login('a@b.com', 'password1')).rejects.toMatchObject({
      code: AuthErrorCode.EMAIL_NOT_VERIFIED,
    });
  });
});
