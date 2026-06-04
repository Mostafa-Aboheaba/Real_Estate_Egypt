/// Full user profile from GET/PATCH `/users/me`.
class UserProfile {
  const UserProfile({
    required this.id,
    required this.email,
    required this.role,
    required this.emailVerified,
    required this.locale,
    this.name,
    this.phone,
    this.avatarUrl,
    this.preferredAgentId,
    this.searchPreferences,
    this.createdAt,
  });

  final String id;
  final String email;
  final String role;
  final bool emailVerified;
  final String locale;
  final String? name;
  final String? phone;
  final String? avatarUrl;
  final String? preferredAgentId;
  final Map<String, dynamic>? searchPreferences;
  final String? createdAt;
}
