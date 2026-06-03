import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Logs HTTP traffic in debug / non-production builds only.
class LoggingInterceptor extends Interceptor {
  LoggingInterceptor({required this.enabled});

  final bool enabled;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (enabled && kDebugMode) {
      debugPrint('[HTTP] ${options.method} ${options.uri}');
    }
    handler.next(options);
  }

  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    if (enabled && kDebugMode) {
      debugPrint('[HTTP] ${response.statusCode} ${response.requestOptions.uri}');
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (enabled && kDebugMode) {
      debugPrint('[HTTP] ERROR ${err.type} ${err.requestOptions.uri}');
    }
    handler.next(err);
  }
}
