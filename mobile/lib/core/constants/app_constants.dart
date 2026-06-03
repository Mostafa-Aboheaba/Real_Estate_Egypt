abstract final class AppConstants {
  static const String correlationIdHeader = 'X-Correlation-Id';
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
