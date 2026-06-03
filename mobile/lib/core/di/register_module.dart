import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/config/app_config.dart';
import 'package:property_assistant/core/config/flavor.dart';

@module
abstract class RegisterModule {
  @lazySingleton
  AppConfig appConfig() => AppConfig.forFlavor(currentFlavor);

  @lazySingleton
  FlutterSecureStorage get secureStorage => const FlutterSecureStorage();

  @lazySingleton
  Connectivity get connectivity => Connectivity();
}

/// Set in flavor entry points before [configureDependencies].
Flavor currentFlavor = Flavor.dev;
