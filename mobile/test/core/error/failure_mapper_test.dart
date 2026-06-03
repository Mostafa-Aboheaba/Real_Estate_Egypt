import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:property_assistant/core/error/exceptions.dart';
import 'package:property_assistant/core/error/failure_mapper.dart';
import 'package:property_assistant/core/error/failures.dart';

void main() {
  group('mapExceptionToFailure', () {
    test('maps NetworkException to Failure.network', () {
      final result = mapExceptionToFailure(const NetworkException('offline'));
      expect(result, isA<NetworkFailure>());
    });

    test('maps DioException connection error to Failure.network', () {
      final result = mapExceptionToFailure(
        DioException(
          requestOptions: RequestOptions(path: '/'),
          type: DioExceptionType.connectionError,
        ),
      );
      expect(result, isA<NetworkFailure>());
    });

    test('maps DioException 401 to Failure.unauthorized', () {
      final result = mapExceptionToFailure(
        DioException(
          requestOptions: RequestOptions(path: '/'),
          type: DioExceptionType.badResponse,
          response: Response(
            requestOptions: RequestOptions(path: '/'),
            statusCode: 401,
          ),
        ),
      );
      expect(result, isA<UnauthorizedFailure>());
    });
  });
}
