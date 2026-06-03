import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';

/// Redirect logic for authenticated vs guest routes.
///
/// Placeholder: always allow until M3 authentication is implemented.
class RouteGuards {
  const RouteGuards({this.isAuthenticated = false});

  final bool isAuthenticated;

  String? redirect(BuildContext context, GoRouterState state) {
    final location = state.matchedLocation;
    final isAuthRoute =
        location == RoutePaths.login || location == RoutePaths.register;

    if (!isAuthenticated && location == RoutePaths.home) {
      return null;
    }
    if (isAuthenticated && isAuthRoute) {
      return RoutePaths.home;
    }
    return null;
  }
}
