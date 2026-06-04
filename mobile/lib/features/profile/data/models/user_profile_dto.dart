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

  factory UserProfileDto.fromJson(Map<String, dynamic> json) =>
      _$UserProfileDtoFromJson(json);
}
