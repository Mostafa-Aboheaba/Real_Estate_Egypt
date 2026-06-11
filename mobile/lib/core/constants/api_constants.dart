/// REST API path segments (base URL lives in [AppConfig]).
abstract final class ApiConstants {
  static const String health = '/health';
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';
  static const String authLogout = '/auth/logout';
  static const String authRefresh = '/auth/refresh';
  static const String authForgotPassword = '/auth/forgot-password';
  static const String authGoogle = '/auth/google';
  static const String authApple = '/auth/apple';
  static const String usersMe = '/users/me';
  static const String usersMePreferences = '/users/me/preferences';
  static const String usersMeFavorites = '/users/me/favorites';
  static const String properties = '/properties';
  static const String aiAgents = '/ai/agents';
  static const String conversations = '/conversations';
  static const String recommendations = '/recommendations';
  static const String recommendationsFeedback = '/recommendations/feedback';
  static const String bookings = '/bookings';
  static const String agentBookings = '/agent/bookings';
}
