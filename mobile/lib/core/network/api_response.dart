/// Unwraps `{ "data": { ... } }` envelopes from the API.
Map<String, dynamic>? unwrapApiData(dynamic body) {
  if (body is! Map<String, dynamic>) {
    return null;
  }
  final nested = body['data'];
  if (nested is Map<String, dynamic>) {
    return nested;
  }
  return body;
}
