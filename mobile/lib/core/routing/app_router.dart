import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/providers/app_providers.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/features/authentication/presentation/pages/login_page.dart';
import 'package:property_assistant/features/authentication/presentation/pages/register_page.dart';
import 'package:property_assistant/features/home/presentation/pages/home_page.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

/// [GoRouter] instance provided via Riverpod.
final appRouterProvider = Provider<GoRouter>((ref) {
  final guards = ref.watch(routeGuardsProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RoutePaths.home,
    debugLogDiagnostics: true,
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
    ],
  );
});
