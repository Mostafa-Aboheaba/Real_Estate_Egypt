import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';

/// Redirect logic for authenticated vs guest routes.
class RouteGuards {
  const RouteGuards({required this.isAuthenticated});

  final bool isAuthenticated;

  static const _publicPaths = {
    RoutePaths.login,
    RoutePaths.register,
    RoutePaths.forgotPassword,
    RoutePaths.verifyEmailPending,
  };

  String? redirect(BuildContext context, GoRouterState state) {
    final location = state.matchedLocation;
    final isPublic = _publicPaths.contains(location);

    if (!isAuthenticated && !isPublic) {
      return RoutePaths.login;
    }
    if (isAuthenticated && isPublic) {
      return RoutePaths.home;
    }
    return null;
  }
}
