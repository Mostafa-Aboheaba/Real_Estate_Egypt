import 'package:flutter/foundation.dart';
import 'package:property_assistant/core/config/flavor.dart';

/// Default dev API host per platform (override with `--dart-define=API_BASE_URL=...`).
String devApiBaseUrlDefault() {
  if (kIsWeb) {
    return 'http://localhost:3000/api/v1';
  }
  return switch (defaultTargetPlatform) {
    TargetPlatform.android => 'http://10.0.2.2:3000/api/v1',
    _ => 'http://127.0.0.1:3000/api/v1',
  };
}

/// Environment configuration resolved at startup from [Flavor].
class AppConfig {
  AppConfig({
    required this.flavor,
    required this.apiBaseUrl,
    required this.appName,
    required this.enableNetworkLogging,
  });

  final Flavor flavor;
  final String apiBaseUrl;
  final String appName;
  final bool enableNetworkLogging;

  /// Server root for `/health` (outside `/api/v1`).
  String get apiRootUrl =>
      apiBaseUrl.replaceFirst(RegExp(r'/api/v1/?$'), '');

  static AppConfig forFlavor(Flavor flavor) {
    return switch (flavor) {
      Flavor.dev => AppConfig(
          flavor: flavor,
          apiBaseUrl: _devApiBaseUrl(),
          appName: 'Property Assistant Dev',
          enableNetworkLogging: true,
        ),
      Flavor.staging => AppConfig(
          flavor: flavor,
          apiBaseUrl: const String.fromEnvironment(
            'API_BASE_URL',
            defaultValue: 'https://api-staging.propertyassistant.eg/api/v1',
          ),
          appName: 'Property Assistant Staging',
          enableNetworkLogging: true,
        ),
      Flavor.prod => AppConfig(
          flavor: flavor,
          apiBaseUrl: const String.fromEnvironment(
            'API_BASE_URL',
            defaultValue: 'https://api.propertyassistant.eg/api/v1',
          ),
          appName: 'Property Assistant',
          enableNetworkLogging: false,
        ),
    };
  }

  static String _devApiBaseUrl() {
    const fromEnv = String.fromEnvironment('API_BASE_URL');
    if (fromEnv.isNotEmpty) {
      return fromEnv;
    }
    return devApiBaseUrlDefault();
  }
}
