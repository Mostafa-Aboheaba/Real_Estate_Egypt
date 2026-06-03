import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:uuid/uuid.dart';

const _accessTokenKey = 'access_token';
const _refreshTokenKey = 'refresh_token';

/// Attaches JWT and correlation ID; refreshes token on 401.
@lazySingleton
class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor(
    this._storage, {
    @Named('refresh') required Dio refreshDio,
  }) : _refreshDio = refreshDio;

  final FlutterSecureStorage _storage;
  final Dio _refreshDio;
  final _uuid = const Uuid();

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    options.headers.putIfAbsent('X-Correlation-Id', () => _uuid.v4());
    final token = await _storage.read(key: _accessTokenKey);
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      handler.next(err);
      return;
    }
    final refreshed = await _tryRefresh();
    if (!refreshed) {
      handler.next(err);
      return;
    }
    try {
      final token = await _storage.read(key: _accessTokenKey);
      err.requestOptions.headers['Authorization'] = 'Bearer $token';
      final response = await _refreshDio.fetch<dynamic>(err.requestOptions);
      handler.resolve(response);
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }

  Future<bool> _tryRefresh() async {
    final refresh = await _storage.read(key: _refreshTokenKey);
    if (refresh == null || refresh.isEmpty) {
      return false;
    }
    try {
      final response = await _refreshDio.post<Map<String, dynamic>>(
        ApiConstants.authRefresh,
        data: {'refreshToken': refresh},
      );
      final data = response.data;
      final access = data?['accessToken'] as String?;
      final newRefresh = data?['refreshToken'] as String?;
      if (access == null) {
        return false;
      }
      await _storage.write(key: _accessTokenKey, value: access);
      if (newRefresh != null) {
        await _storage.write(key: _refreshTokenKey, value: newRefresh);
      }
      return true;
    } on DioException {
      await _storage.delete(key: _accessTokenKey);
      await _storage.delete(key: _refreshTokenKey);
      return false;
    }
  }
}
