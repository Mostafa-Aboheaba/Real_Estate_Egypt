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

  @override
  String get profileTitle => 'الملف الشخصي';

  @override
  String get profileEdit => 'تعديل الملف';

  @override
  String get profileName => 'الاسم';

  @override
  String get profilePhone => 'الهاتف';

  @override
  String get profileLanguage => 'اللغة';

  @override
  String get profileDefaultAgent => 'وكيل الذكاء الاصطناعي';

  @override
  String get profileFavorites => 'المفضلة';

  @override
  String get profileFavoritesEmpty => 'لا توجد عقارات محفوظة.';

  @override
  String get profileSave => 'حفظ';

  @override
  String get profileSignOut => 'تسجيل الخروج';

  @override
  String get profileSignInRequired => 'سجّل الدخول لعرض ملفك.';

  @override
  String get chatTitle => 'محادثة الذكاء الاصطناعي';

  @override
  String get chatInputHint => 'اسأل عن العقارات في مصر…';

  @override
  String get chatAiDisclaimer =>
      'إرشادات مولّدة بالذكاء الاصطناعي — ليست استشارة قانونية أو مالية.';

  @override
  String get chatSwitchAgent => 'تغيير الوكيل';

  @override
  String get chatRetry => 'إعادة المحاولة';

  @override
  String get recommendationsPersonalizedTitle => 'عقارات قد تعجبك';

  @override
  String get recommendationsPopularTitle => 'الأكثر شعبية في القاهرة';

  @override
  String get recommendationsGuestCta => 'سجّل الدخول للحصول على توصيات مخصصة.';

  @override
  String get recommendationsSignIn => 'تسجيل الدخول';

  @override
  String get recommendationsRefresh => 'تحديث التوصيات';
}
