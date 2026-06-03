/// Signed-in user profile from auth or `/users/me`.
class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.role,
    required this.emailVerified,
    required this.locale,
    this.name,
  });

  final String id;
  final String email;
  final String role;
  final bool emailVerified;
  final String locale;
  final String? name;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      emailVerified: json['emailVerified'] as bool? ?? false,
      locale: json['locale'] as String? ?? 'en',
      name: json['name'] as String?,
    );
  }
}
