// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'مساعد العقارات';

  @override
  String get homeWelcome => 'أهلاً بك';

  @override
  String get homeSubtitle => 'اكتشف العقارات في مصر بمساعدة الذكاء الاصطناعي.';

  @override
  String get browseProperties => 'تصفح العقارات';

  @override
  String get searchTitle => 'بحث العقارات';

  @override
  String get searchHint => 'ابحث بالكلمة أو المنطقة…';

  @override
  String searchResultsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count نتائج',
      one: 'نتيجة واحدة',
      zero: 'لا نتائج',
    );
    return '$_temp0';
  }

  @override
  String get propertyDetailTitle => 'تفاصيل العقار';

  @override
  String get propertyDescription => 'الوصف';

  @override
  String get propertyAmenities => 'المرافق';
}
