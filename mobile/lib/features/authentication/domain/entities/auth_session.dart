import 'package:property_assistant/features/authentication/domain/entities/auth_user.dart';

/// Active session after login or OAuth.
class AuthSession {
  const AuthSession({
    required this.user,
    required this.expiresIn,
  });

  final AuthUser user;
  final int expiresIn;
}
