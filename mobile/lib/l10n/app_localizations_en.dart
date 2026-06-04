// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Property Assistant';

  @override
  String get homeWelcome => 'Welcome';

  @override
  String get homeSubtitle => 'Discover properties in Egypt with AI assistance.';

  @override
  String get browseProperties => 'Browse properties';

  @override
  String get searchTitle => 'Search properties';

  @override
  String get searchHint => 'Search by keyword, area…';

  @override
  String searchResultsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count results',
      one: '1 result',
      zero: 'No results',
    );
    return '$_temp0';
  }

  @override
  String get propertyDetailTitle => 'Property details';

  @override
  String get propertyDescription => 'Description';

  @override
  String get propertyAmenities => 'Amenities';
}
