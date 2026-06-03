import 'package:dio/dio.dart';
import 'package:property_assistant/core/error/exceptions.dart';
import 'package:property_assistant/core/error/failures.dart';

Failure mapExceptionToFailure(Object error) {
  if (error is Failure) {
    return error;
  }
  if (error is UnauthorizedException) {
    return Failure.unauthorized(message: error.message);
  }
  if (error is NetworkException) {
    return Failure.network(message: error.message);
  }
  if (error is ServerException) {
    return Failure.server(message: error.message);
  }
  if (error is DioException) {
    return switch (error.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.receiveTimeout ||
      DioExceptionType.connectionError =>
        const Failure.network(),
      DioExceptionType.badResponse when error.response?.statusCode == 401 =>
        const Failure.unauthorized(),
      DioExceptionType.badResponse =>
        Failure.server(message: error.message),
      _ => Failure.unknown(message: error.message),
    };
  }
  return Failure.unknown(message: error.toString());
}
