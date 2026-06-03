import 'package:property_assistant/features/authentication/domain/entities/auth_session.dart';

/// Authentication operations (email, OAuth, session restore).
abstract class AuthRepository {
  Future<void> register({
    required String email,
    required String password,
    required String role,
    required String locale,
    required bool consentAccepted,
  });

  Future<AuthSession> login({
    required String email,
    required String password,
  });

  Future<AuthSession> signInWithGoogle({String role});

  Future<AuthSession> signInWithApple({String role});

  Future<void> forgotPassword(String email);

  Future<void> logout();

  Future<AuthSession?> restoreSession();
}
