import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:property_assistant/core/constants/app_constants.dart';
import 'package:property_assistant/core/network/api_client.dart';
import 'package:property_assistant/core/network/api_response.dart';
import 'package:property_assistant/features/authentication/domain/entities/auth_session.dart';
import 'package:property_assistant/features/authentication/domain/entities/auth_user.dart';

@lazySingleton
class AuthRemoteDataSource {
  AuthRemoteDataSource(this._client);

  final ApiClient _client;

  Future<void> register({
    required String email,
    required String password,
    required String role,
    required String locale,
    required bool consentAccepted,
  }) async {
    await _client.post<Map<String, dynamic>>(
      ApiConstants.authRegister,
      data: {
        'email': email,
        'password': password,
        'role': role,
        'locale': locale,
        'consentAccepted': consentAccepted,
        'consentVersion': AppConstants.consentVersion,
      },
    );
  }

  Future<void> forgotPassword(String email) async {
    await _client.post<Map<String, dynamic>>(
      ApiConstants.authForgotPassword,
      data: {'email': email},
    );
  }

  Future<void> logout(String refreshToken) async {
    await _client.post<void>(
      ApiConstants.authLogout,
      data: {'refreshToken': refreshToken},
    );
  }

  Future<AuthUser> getMe() async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.usersMe,
    );
    final data = unwrapApiData(response.data);
    if (data == null) {
      throw const FormatException('Invalid /users/me response');
    }
    return AuthUser.fromJson(data);
  }

  AuthSession _parseAuthSession(Map<String, dynamic>? body) {
    final data = unwrapApiData(body);
    if (data == null) {
      throw const FormatException('Invalid auth response');
    }
    final userJson = data['user'] as Map<String, dynamic>?;
    if (userJson == null) {
      throw const FormatException('Missing user in auth response');
    }
    return AuthSession(
      user: AuthUser.fromJson(userJson),
      expiresIn: data['expiresIn'] as int? ?? 900,
    );
  }

  /// Tokens from login/OAuth responses (caller persists via [TokenStorage]).
  ({String accessToken, String refreshToken}) parseTokens(
    Map<String, dynamic>? body,
  ) {
    final data = unwrapApiData(body);
    if (data == null) {
      throw const FormatException('Invalid auth response');
    }
    final access = data['accessToken'] as String?;
    final refresh = data['refreshToken'] as String?;
    if (access == null || refresh == null) {
      throw const FormatException('Missing tokens in auth response');
    }
    return (accessToken: access, refreshToken: refresh);
  }

  Future<({AuthSession session, String access, String refresh})> loginWithTokens({
    required String email,
    required String password,
  }) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.authLogin,
      data: {'email': email, 'password': password},
    );
    final tokens = parseTokens(response.data);
    return (
      session: _parseAuthSession(response.data),
      access: tokens.accessToken,
      refresh: tokens.refreshToken,
    );
  }

  Future<({AuthSession session, String access, String refresh})>
      googleWithTokens({
    required String idToken,
    required String role,
  }) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.authGoogle,
      data: {'idToken': idToken, 'role': role},
    );
    final tokens = parseTokens(response.data);
    return (
      session: _parseAuthSession(response.data),
      access: tokens.accessToken,
      refresh: tokens.refreshToken,
    );
  }

  Future<({AuthSession session, String access, String refresh})> appleWithTokens({
    required String identityToken,
    required String role,
  }) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.authApple,
      data: {'identityToken': identityToken, 'role': role},
    );
    final tokens = parseTokens(response.data);
    return (
      session: _parseAuthSession(response.data),
      access: tokens.accessToken,
      refresh: tokens.refreshToken,
    );
  }
}
