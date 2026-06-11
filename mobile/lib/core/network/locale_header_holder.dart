import 'package:flutter/material.dart';
import 'package:injectable/injectable.dart';

/// Current API [Accept-Language] value, synced from app/profile locale.
@lazySingleton
class LocaleHeaderHolder {
  String acceptLanguage = 'ar-EG';

  void setFromLocale(Locale locale) {
    acceptLanguage = locale.languageCode == 'ar' ? 'ar-EG' : 'en';
  }

  void setFromApiLocale(String apiLocale) {
    acceptLanguage = apiLocale.toLowerCase().startsWith('ar') ? 'ar-EG' : 'en';
  }
}
