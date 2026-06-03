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
    upsertOAuthAccount: jest.fn(),
  };

  const tokens = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    hashRefreshToken: jest.fn(),
  };

  const passwords = { hash: jest.fn(), compare: jest.fn() };
  const emailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };
  const googleVerifier = { verify: jest.fn() };
  const appleVerifier = { verify: jest.fn() };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      repo as never,
      tokens as never,
      passwords as never,
      emailService as never,
      googleVerifier as never,
      appleVerifier as never,
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
      role: 'buyer',
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
    expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    expect(repo.saveEmailVerificationToken).toHaveBeenCalled();
  });
});
