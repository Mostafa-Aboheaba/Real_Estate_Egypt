import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/widgets/error_view.dart';
import 'package:property_assistant/core/widgets/loading_indicator.dart';
import 'package:property_assistant/core/error/failures.dart';
import 'package:property_assistant/features/booking/domain/entities/booking.dart';
import 'package:property_assistant/features/booking/presentation/providers/booking_provider.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class AgentBookingInboxPage extends ConsumerWidget {
  const AgentBookingInboxPage({this.initialBookingId, super.key});

  /// Deep link stub — scroll/highlight when opened from push.
  final String? initialBookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final bookings = ref.watch(agentBookingsProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.agentBookingsTitle)),
      body: bookings.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          failure: Failure.unknown(message: e.toString()),
          onRetry: () => ref.invalidate(agentBookingsProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return Center(child: Text(l10n.agentBookingsEmpty));
          }
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(agentBookingsProvider.notifier).refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final booking = items[index];
                final highlighted = booking.id == initialBookingId;
                return _BookingRequestCard(
                  booking: booking,
                  highlighted: highlighted,
                  onConfirm: () => ref
                      .read(agentBookingsProvider.notifier)
                      .confirm(booking),
                  onDecline: () => ref
                      .read(agentBookingsProvider.notifier)
                      .decline(booking),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _BookingRequestCard extends StatelessWidget {
  const _BookingRequestCard({
    required this.booking,
    required this.highlighted,
    required this.onConfirm,
    required this.onDecline,
  });

  final Booking booking;
  final bool highlighted;
  final VoidCallback onConfirm;
  final VoidCallback onDecline;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      color: highlighted
          ? Theme.of(context).colorScheme.primaryContainer.withValues(
                alpha: 0.35,
              )
          : null,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              booking.propertyTitle ?? booking.propertyId,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 4),
            Text(booking.preferredAt.toLocal().toString()),
            if (booking.buyerMessage != null) ...[
              const SizedBox(height: 8),
              Text(booking.buyerMessage!),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onDecline,
                    child: Text(l10n.agentBookingDecline),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: FilledButton(
                    onPressed: onConfirm,
                    child: Text(l10n.agentBookingConfirm),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
