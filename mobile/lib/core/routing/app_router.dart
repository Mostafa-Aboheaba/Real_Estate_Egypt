import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_guards.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/features/authentication/presentation/pages/forgot_password_page.dart';
import 'package:property_assistant/features/authentication/presentation/pages/login_page.dart';
import 'package:property_assistant/features/authentication/presentation/pages/register_page.dart';
import 'package:property_assistant/features/authentication/presentation/pages/verify_email_pending_page.dart';
import 'package:property_assistant/features/authentication/presentation/providers/auth_provider.dart';
import 'package:property_assistant/features/home/presentation/pages/home_page.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

/// [GoRouter] instance provided via Riverpod.
final appRouterProvider = Provider<GoRouter>((ref) {
  final refresh = ref.watch(authRouterRefreshProvider);
  final session = ref.watch(authSessionProvider);
  final isAuthenticated = session.valueOrNull != null;
  final guards = RouteGuards(isAuthenticated: isAuthenticated);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RoutePaths.home,
    debugLogDiagnostics: true,
    refreshListenable: refresh,
    redirect: guards.redirect,
    routes: [
      GoRoute(
        path: RoutePaths.home,
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: RoutePaths.login,
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: RoutePaths.register,
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: RoutePaths.forgotPassword,
        name: 'forgotPassword',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      GoRoute(
        path: RoutePaths.verifyEmailPending,
        name: 'verifyEmailPending',
        builder: (context, state) => const VerifyEmailPendingPage(),
      ),
    ],
  );
});
