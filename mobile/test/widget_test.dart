import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/app.dart';
import 'package:property_assistant/core/config/app_config.dart';
import 'package:property_assistant/core/config/flavor.dart';
import 'package:property_assistant/core/providers/app_providers.dart';
import 'package:property_assistant/features/home/data/models/app_status.dart';
import 'package:property_assistant/features/home/presentation/providers/home_provider.dart';

void main() {
  testWidgets('App renders home scaffold', (tester) async {
    final config = AppConfig.forFlavor(Flavor.dev);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          appConfigProvider.overrideWithValue(config),
          homeBootstrapProvider.overrideWith(
            (ref) async => const AppStatus(message: 'Ready', isHealthy: true),
          ),
        ],
        child: const App(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
