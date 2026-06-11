import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/config/app_config.dart';
import 'package:property_assistant/core/constants/app_constants.dart';
import 'package:property_assistant/core/network/auth_interceptor.dart';
import 'package:property_assistant/core/network/envelope_unwrap_interceptor.dart';
import 'package:property_assistant/core/network/locale_interceptor.dart';
import 'package:property_assistant/core/network/logging_interceptor.dart';

@module
abstract class DioModule {
  @lazySingleton
  Dio dio(
    AppConfig config,
    AuthInterceptor authInterceptor,
    LocaleInterceptor localeInterceptor,
    LoggingInterceptor loggingInterceptor,
  ) {
    final dio = Dio(
      BaseOptions(
        baseUrl: config.apiBaseUrl,
        connectTimeout: AppConstants.connectTimeout,
        receiveTimeout: AppConstants.receiveTimeout,
        headers: {'Accept': 'application/json'},
      ),
    );
    dio.interceptors.addAll([
      EnvelopeUnwrapInterceptor(),
      localeInterceptor,
      authInterceptor,
      loggingInterceptor,
    ]);
    return dio;
  }

  /// Separate client for token refresh (no auth interceptor loop).
  @Named('refresh')
  @lazySingleton
  Dio refreshDio(AppConfig config, LoggingInterceptor loggingInterceptor) {
    final dio = Dio(
      BaseOptions(
        baseUrl: config.apiBaseUrl,
        connectTimeout: AppConstants.connectTimeout,
        receiveTimeout: AppConstants.receiveTimeout,
        headers: {'Accept': 'application/json'},
      ),
    );
    if (config.enableNetworkLogging) {
      dio.interceptors.add(loggingInterceptor);
    }
    return dio;
  }

  @lazySingleton
  LoggingInterceptor loggingInterceptor(AppConfig config) {
    return LoggingInterceptor(enabled: config.enableNetworkLogging);
  }
}
