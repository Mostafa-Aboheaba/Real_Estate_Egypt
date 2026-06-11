import 'package:flutter_test/flutter_test.dart';
import 'package:property_assistant/features/booking/presentation/providers/booking_provider.dart';

void main() {
  test('BookingRequestState copyWith clears errors when requested', () {
    const state = BookingRequestState(
      errorMessage: 'failed',
      fieldErrors: {'preferredAt': 'required'},
    );
    final next = state.copyWith(clearErrors: true, isSubmitting: true);
    expect(next.errorMessage, isNull);
    expect(next.fieldErrors, isEmpty);
    expect(next.isSubmitting, isTrue);
  });
}
