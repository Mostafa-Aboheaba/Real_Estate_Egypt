import 'package:flutter_test/flutter_test.dart';
import 'package:property_assistant/features/home/data/models/app_status.dart';

void main() {
  test('AppStatus freezed model holds values', () {
    const status = AppStatus(message: 'ok', isHealthy: true);
    expect(status.message, 'ok');
    expect(status.isHealthy, isTrue);
    expect(status.copyWith(isHealthy: false).isHealthy, isFalse);
  });
}
