import 'package:dio/dio.dart';

/// Unwraps `{ "data": { ... } }` API envelopes (skips paginated `{ data, meta }`).
class EnvelopeUnwrapInterceptor extends Interceptor {
  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    final body = response.data;
    if (body is Map<String, dynamic> &&
        body.containsKey('data') &&
        !body.containsKey('meta')) {
      response.data = body['data'];
    }
    handler.next(response);
  }
}
