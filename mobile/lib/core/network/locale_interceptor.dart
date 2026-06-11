import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/network/locale_header_holder.dart';

@lazySingleton
class LocaleInterceptor extends Interceptor {
  LocaleInterceptor(this._locale);

  final LocaleHeaderHolder _locale;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) {
    options.headers['Accept-Language'] = _locale.acceptLanguage;
    handler.next(options);
  }
}
