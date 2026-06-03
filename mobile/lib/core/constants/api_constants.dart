/// REST API path segments (base URL lives in [AppConfig]).
abstract final class ApiConstants {
  static const String health = '/health';
  static const String authLogin = '/auth/login';
  static const String authRefresh = '/auth/refresh';
  static const String usersMe = '/users/me';
  static const String properties = '/properties';
}
