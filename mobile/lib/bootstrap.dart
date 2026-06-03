import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/app.dart';
import 'package:property_assistant/core/config/flavor.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/core/di/register_module.dart';

Future<void> bootstrap(Flavor flavor) async {
  WidgetsFlutterBinding.ensureInitialized();
  currentFlavor = flavor;
  await configureDependencies();
  runApp(const ProviderScope(child: App()));
}
