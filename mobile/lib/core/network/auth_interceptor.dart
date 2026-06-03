import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/auth/session_expired_notifier.dart';
import 'package:property_assistant/core/auth/token_storage.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:property_assistant/core/network/api_response.dart';
import 'package:uuid/uuid.dart';

/// Attaches JWT and correlation ID; refreshes token on 401.
@lazySingleton
class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor(
    this._tokens,
    this._sessionExpired, {
    @Named('refresh') required Dio refreshDio,
  }) : _refreshDio = refreshDio;

  final TokenStorage _tokens;
  final SessionExpiredNotifier _sessionExpired;
  final Dio _refreshDio;
  final _uuid = const Uuid();

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    options.headers.putIfAbsent('X-Correlation-Id', () => _uuid.v4());
    final token = await _tokens.readAccessToken();
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
      _sessionExpired.notify();
      handler.next(err);
      return;
    }
    try {
      final token = await _tokens.readAccessToken();
      err.requestOptions.headers['Authorization'] = 'Bearer $token';
      final response = await _refreshDio.fetch<dynamic>(err.requestOptions);
      handler.resolve(response);
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }

  Future<bool> _tryRefresh() async {
    final refresh = await _tokens.readRefreshToken();
    if (refresh == null || refresh.isEmpty) {
      return false;
    }
    try {
      final response = await _refreshDio.post<Map<String, dynamic>>(
        ApiConstants.authRefresh,
        data: {'refreshToken': refresh},
      );
      final data = unwrapApiData(response.data);
      final access = data?['accessToken'] as String?;
      final newRefresh = data?['refreshToken'] as String?;
      if (access == null || newRefresh == null) {
        return false;
      }
      await _tokens.saveTokens(
        accessToken: access,
        refreshToken: newRefresh,
      );
      return true;
    } on DioException {
      await _tokens.clear();
      _sessionExpired.notify();
      return false;
    }
  }
}
