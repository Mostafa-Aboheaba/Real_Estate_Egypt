import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:injectable/injectable.dart';

/// Persists JWT access and refresh tokens for [AuthInterceptor].
@lazySingleton
class TokenStorage {
  TokenStorage(this._storage);

  static const accessTokenKey = 'access_token';
  static const refreshTokenKey = 'refresh_token';

  final FlutterSecureStorage _storage;

  Future<bool> hasSession() async {
    final access = await _storage.read(key: accessTokenKey);
    return access != null && access.isNotEmpty;
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: accessTokenKey, value: accessToken);
    await _storage.write(key: refreshTokenKey, value: refreshToken);
  }

  Future<String?> readAccessToken() =>
      _storage.read(key: accessTokenKey);

  Future<String?> readRefreshToken() =>
      _storage.read(key: refreshTokenKey);

  Future<void> clear() async {
    await _storage.delete(key: accessTokenKey);
    await _storage.delete(key: refreshTokenKey);
  }
}
