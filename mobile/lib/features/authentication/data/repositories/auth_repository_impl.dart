import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/auth/token_storage.dart';
import 'package:property_assistant/features/authentication/data/datasources/auth_remote_datasource.dart';
import 'package:property_assistant/features/authentication/domain/entities/auth_session.dart';
import 'package:property_assistant/features/authentication/domain/repositories/auth_repository.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

@LazySingleton(as: AuthRepository)
class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remote, this._tokens);

  final AuthRemoteDataSource _remote;
  final TokenStorage _tokens;

  @override
  Future<void> register({
    required String email,
    required String password,
    required String role,
    required String locale,
    required bool consentAccepted,
  }) =>
      _remote.register(
        email: email,
        password: password,
        role: role,
        locale: locale,
        consentAccepted: consentAccepted,
      );

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final result = await _remote.loginWithTokens(
      email: email,
      password: password,
    );
    await _tokens.saveTokens(
      accessToken: result.access,
      refreshToken: result.refresh,
    );
    return result.session;
  }

  @override
  Future<AuthSession> signInWithGoogle({String role = 'buyer'}) async {
    final google = GoogleSignIn(scopes: ['email']);
    final account = await google.signIn();
    if (account == null) {
      throw StateError('Google sign-in cancelled');
    }
    final auth = await account.authentication;
    final idToken = auth.idToken;
    if (idToken == null) {
      throw StateError('Google ID token missing');
    }
    final result = await _remote.googleWithTokens(
      idToken: idToken,
      role: role,
    );
    await _tokens.saveTokens(
      accessToken: result.access,
      refreshToken: result.refresh,
    );
    return result.session;
  }

  @override
  Future<AuthSession> signInWithApple({String role = 'buyer'}) async {
    final credential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );
    final token = credential.identityToken;
    if (token == null) {
      throw StateError('Apple identity token missing');
    }
    final result = await _remote.appleWithTokens(
      identityToken: token,
      role: role,
    );
    await _tokens.saveTokens(
      accessToken: result.access,
      refreshToken: result.refresh,
    );
    return result.session;
  }

  @override
  Future<void> forgotPassword(String email) => _remote.forgotPassword(email);

  @override
  Future<void> logout() async {
    final refresh = await _tokens.readRefreshToken();
    if (refresh != null && refresh.isNotEmpty) {
      try {
        await _remote.logout(refresh);
      } catch (_) {
        // Best-effort revoke; always clear local tokens.
      }
    }
    await _tokens.clear();
  }

  @override
  Future<AuthSession?> restoreSession() async {
    if (!await _tokens.hasSession()) {
      return null;
    }
    try {
      final user = await _remote.getMe();
      return AuthSession(user: user, expiresIn: 900);
    } catch (_) {
      await _tokens.clear();
      return null;
    }
  }
}
