abstract final class AppConstants {
  /// Must match backend consent tracking version.
  static const String consentVersion = '2026-06-01';

  static const String correlationIdHeader = 'X-Correlation-Id';
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
