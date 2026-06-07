/// Central route path constants for [GoRouter].
abstract final class RoutePaths {
  static const String splash = '/';
  static const String home = '/home';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String verifyEmailPending = '/verify-email-pending';
  static const String search = '/search';
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String favorites = '/favorites';
  static const String chat = '/chat';
  static String propertyDetail(String id) => '/properties/$id';
}
