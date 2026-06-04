// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserProfileDto _$UserProfileDtoFromJson(Map<String, dynamic> json) =>
    UserProfileDto(
      id: json['id'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      emailVerified: json['emailVerified'] as bool,
      locale: json['locale'] as String,
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      preferredAgentId: json['preferredAgentId'] as String?,
      searchPreferences: json['searchPreferences'] as Map<String, dynamic>?,
      createdAt: json['createdAt'] as String?,
    );
