import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/error/exceptions.dart';
import 'package:property_assistant/core/network/network_info.dart';

/// Thin wrapper over [Dio] with connectivity checks.
@lazySingleton
class ApiClient {
  ApiClient(this._dio, this._networkInfo);

  final Dio _dio;
  final NetworkInfo _networkInfo;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _request(() => _dio.get<T>(path, queryParameters: queryParameters));
  }

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _request(
      () => _dio.post<T>(path, data: data, queryParameters: queryParameters),
    );
  }

  Future<Response<T>> _request<T>(
    Future<Response<T>> Function() call,
  ) async {
    if (!await _networkInfo.isConnected) {
      throw const NetworkException();
    }
    try {
      return await call();
    } on DioException catch (e) {
      if (e.response != null && e.response!.statusCode != null) {
        if (e.response!.statusCode! >= 500) {
          throw ServerException(e.message ?? 'Server error');
        }
        if (e.response!.statusCode == 401) {
          throw const UnauthorizedException();
        }
      }
      rethrow;
    }
  }
}
