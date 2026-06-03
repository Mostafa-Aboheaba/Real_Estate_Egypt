/// Data-layer exceptions mapped to [Failure] in the domain layer.
sealed class AppException implements Exception {
  const AppException(this.message);
  final String message;
}

final class ServerException extends AppException {
  const ServerException([super.message = 'Server error']);
}

final class NetworkException extends AppException {
  const NetworkException([super.message = 'No network connection']);
}

final class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = 'Unauthorized']);
}

final class CacheException extends AppException {
  const CacheException([super.message = 'Cache error']);
}
