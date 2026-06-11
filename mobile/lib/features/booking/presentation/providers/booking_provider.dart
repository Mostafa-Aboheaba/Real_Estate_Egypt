import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/features/booking/domain/entities/booking.dart';
import 'package:property_assistant/features/booking/domain/repositories/booking_repository.dart';
import 'package:uuid/uuid.dart';

final bookingRepositoryProvider = Provider<BookingRepository>(
  (ref) => getIt<BookingRepository>(),
);

final agentBookingsProvider =
    AsyncNotifierProvider<AgentBookingsNotifier, List<Booking>>(
  AgentBookingsNotifier.new,
);

class AgentBookingsNotifier extends AsyncNotifier<List<Booking>> {
  @override
  Future<List<Booking>> build() => _load();

  Future<List<Booking>> _load() =>
      ref.read(bookingRepositoryProvider).listAgentBookings(
            status: 'requested',
          );

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_load);
  }

  Future<void> confirm(Booking booking) async {
    await ref.read(bookingRepositoryProvider).confirmBooking(
          bookingId: booking.id,
          scheduledAt: booking.preferredAt,
        );
    await refresh();
  }

  Future<void> decline(Booking booking, {String? reason}) async {
    await ref.read(bookingRepositoryProvider).declineBooking(
          bookingId: booking.id,
          reason: reason,
        );
    await refresh();
  }
}

class BookingRequestState {
  const BookingRequestState({
    this.isSubmitting = false,
    this.fieldErrors = const {},
    this.errorMessage,
    this.success = false,
  });

  final bool isSubmitting;
  final Map<String, String> fieldErrors;
  final String? errorMessage;
  final bool success;

  BookingRequestState copyWith({
    bool? isSubmitting,
    Map<String, String>? fieldErrors,
    String? errorMessage,
    bool? success,
    bool clearErrors = false,
  }) {
    return BookingRequestState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      fieldErrors: clearErrors
          ? const {}
          : (fieldErrors ?? this.fieldErrors),
      errorMessage: clearErrors ? null : (errorMessage ?? this.errorMessage),
      success: success ?? this.success,
    );
  }
}

final bookingRequestProvider =
    NotifierProvider.family<BookingRequestNotifier, BookingRequestState, String>(
  BookingRequestNotifier.new,
);

class BookingRequestNotifier extends FamilyNotifier<BookingRequestState, String> {
  @override
  BookingRequestState build(String propertyId) =>
      const BookingRequestState();

  Future<bool> submit({
    required DateTime? preferredAt,
    String? message,
  }) async {
    final errors = <String, String>{};
    if (preferredAt == null) {
      errors['preferredAt'] = 'required';
    } else if (preferredAt.isBefore(DateTime.now())) {
      errors['preferredAt'] = 'future';
    }

    if (errors.isNotEmpty) {
      state = state.copyWith(fieldErrors: errors, clearErrors: true);
      return false;
    }

    state = state.copyWith(isSubmitting: true, clearErrors: true);
    try {
      await ref.read(bookingRepositoryProvider).createRequest(
            propertyId: arg,
            preferredAt: preferredAt!,
            message: message,
            idempotencyKey: const Uuid().v4(),
          );
      state = state.copyWith(isSubmitting: false, success: true);
      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }
}
