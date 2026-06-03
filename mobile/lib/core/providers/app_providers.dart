import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/config/app_config.dart';
import 'package:property_assistant/core/di/injection.dart';

/// Global [AppConfig] from injectable (set per flavor at startup).
final appConfigProvider = Provider<AppConfig>((ref) {
  return getIt<AppConfig>();
});
