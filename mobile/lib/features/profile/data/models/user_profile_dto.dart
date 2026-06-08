import 'package:json_annotation/json_annotation.dart';

part 'user_profile_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class UserProfileDto {
  const UserProfileDto({
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

  factory UserProfileDto.fromJson(Map<String, dynamic> json) {
    return UserProfileDto(
      id: json['id'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      emailVerified: json['emailVerified'] as bool? ?? false,
      locale: json['locale'] as String? ?? 'ar-EG',
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      preferredAgentId: json['preferredAgentId'] as String?,
      searchPreferences: json['searchPreferences'] as Map<String, dynamic>?,
      createdAt: json['createdAt'] as String?,
    );
  }
}
