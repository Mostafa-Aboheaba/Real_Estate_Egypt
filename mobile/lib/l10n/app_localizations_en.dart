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

  @override
  String get profileTitle => 'Profile';

  @override
  String get profileEdit => 'Edit profile';

  @override
  String get profileName => 'Name';

  @override
  String get profilePhone => 'Phone';

  @override
  String get profileLanguage => 'Language';

  @override
  String get profileDefaultAgent => 'Default AI agent';

  @override
  String get profileFavorites => 'Favorites';

  @override
  String get profileFavoritesEmpty => 'No saved properties yet.';

  @override
  String get profileSave => 'Save';

  @override
  String get profileSignOut => 'Sign out';

  @override
  String get profileSignInRequired => 'Sign in to view your profile.';

  @override
  String get chatTitle => 'AI Chat';

  @override
  String get chatInputHint => 'Ask about properties in Egypt…';

  @override
  String get chatAiDisclaimer =>
      'AI-generated guidance — not legal or financial advice.';

  @override
  String get chatSwitchAgent => 'Switch AI agent';

  @override
  String get chatRetry => 'Retry';

  @override
  String get recommendationsPersonalizedTitle => 'Properties you might like';

  @override
  String get recommendationsPopularTitle => 'Popular in Cairo';

  @override
  String get recommendationsGuestCta =>
      'Sign in for personalized recommendations.';

  @override
  String get recommendationsSignIn => 'Sign in';

  @override
  String get recommendationsRefresh => 'Refresh recommendations';
}
