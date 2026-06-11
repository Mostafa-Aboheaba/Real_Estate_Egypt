import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/features/booking/presentation/providers/booking_provider.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class RequestBookingSheet extends ConsumerStatefulWidget {
  const RequestBookingSheet({required this.propertyId, super.key});

  final String propertyId;

  @override
  ConsumerState<RequestBookingSheet> createState() =>
      _RequestBookingSheetState();
}

class _RequestBookingSheetState extends ConsumerState<RequestBookingSheet> {
  DateTime? _preferredAt;
  final _messageController = TextEditingController();

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 60)),
      initialDate: _preferredAt ?? now.add(const Duration(days: 1)),
    );
    if (date == null || !mounted) {
      return;
    }
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(
        _preferredAt ?? date.add(const Duration(hours: 14)),
      ),
    );
    if (time == null) {
      return;
    }
    setState(() {
      _preferredAt = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(bookingRequestProvider(widget.propertyId));

    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.bookingRequestTitle,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: _pickDateTime,
            icon: const Icon(Icons.calendar_today_outlined),
            label: Text(
              _preferredAt == null
                  ? l10n.bookingPickDateTime
                  : _preferredAt!.toLocal().toString(),
            ),
          ),
          if (state.fieldErrors.containsKey('preferredAt'))
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                state.fieldErrors['preferredAt'] == 'future'
                    ? l10n.bookingValidationFuture
                    : l10n.bookingValidationRequired,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                ),
              ),
            ),
          const SizedBox(height: 12),
          TextField(
            controller: _messageController,
            decoration: InputDecoration(
              labelText: l10n.bookingNotesLabel,
              border: const OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
          if (state.errorMessage != null) ...[
            const SizedBox(height: 8),
            Text(
              state.errorMessage!,
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ],
          const SizedBox(height: 16),
          FilledButton(
            onPressed: state.isSubmitting
                ? null
                : () async {
                    final ok = await ref
                        .read(bookingRequestProvider(widget.propertyId).notifier)
                        .submit(
                          preferredAt: _preferredAt,
                          message: _messageController.text.trim(),
                        );
                    if (ok && context.mounted) {
                      Navigator.of(context).pop(true);
                    }
                  },
            child: state.isSubmitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(l10n.bookingSubmit),
          ),
        ],
      ),
    );
  }
}
