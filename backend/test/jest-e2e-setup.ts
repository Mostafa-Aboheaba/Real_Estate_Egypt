jest.mock('../src/infrastructure/auth/apple-id-token.verifier', () => ({
  AppleIdTokenVerifier: class {
    verify = jest.fn();
  },
}));

jest.mock('../src/infrastructure/auth/google-id-token.verifier', () => ({
  GoogleIdTokenVerifier: class {
    verify = jest.fn();
  },
}));
