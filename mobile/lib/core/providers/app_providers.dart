import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/config/app_config.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/core/routing/route_guards.dart';

/// Global [AppConfig] from injectable (set per flavor at startup).
final appConfigProvider = Provider<AppConfig>((ref) {
  return getIt<AppConfig>();
});

/// Route guard state — replace with auth session in M3.
final routeGuardsProvider = Provider<RouteGuards>((ref) {
  return const RouteGuards(isAuthenticated: false);
});
