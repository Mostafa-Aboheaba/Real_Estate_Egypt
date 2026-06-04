import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';
import 'package:property_assistant/features/property_search/presentation/pages/search_page.dart';
import 'package:property_assistant/features/property_search/presentation/providers/property_search_provider.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

void main() {
  testWidgets('SearchPage shows error view when search fails', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          propertySearchProvider.overrideWith(_ErrorSearchNotifier.new),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const SearchPage(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Network error'), findsOneWidget);
  });
}

class _ErrorSearchNotifier extends PropertySearchNotifier {
  @override
  PropertySearchState build() {
    return const PropertySearchState(
      error: 'Network error',
      filters: PropertySearchFilters(),
    );
  }
}
