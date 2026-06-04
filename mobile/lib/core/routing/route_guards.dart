import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';

/// Redirect logic for authenticated vs guest routes.
class RouteGuards {
  const RouteGuards({required this.isAuthenticated});

  final bool isAuthenticated;

  static const _authOnlyPaths = {
    RoutePaths.login,
    RoutePaths.register,
    RoutePaths.forgotPassword,
    RoutePaths.verifyEmailPending,
  };

  /// Guest browse (FR-SEARCH-016): home, search, listing detail without login.
  static bool isGuestAllowed(String location) {
    if (_authOnlyPaths.contains(location)) {
      return true;
    }
    if (location == RoutePaths.home || location == RoutePaths.search) {
      return true;
    }
    if (location.startsWith('/properties/')) {
      return true;
    }
    return false;
  }

  String? redirect(BuildContext context, GoRouterState state) {
    final location = state.matchedLocation;

    if (!isAuthenticated && !isGuestAllowed(location)) {
      return RoutePaths.login;
    }
    if (isAuthenticated && _authOnlyPaths.contains(location)) {
      return RoutePaths.home;
    }
    return null;
  }
}
