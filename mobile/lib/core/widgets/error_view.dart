import 'package:flutter/material.dart';
import 'package:property_assistant/core/error/failures.dart';

class ErrorView extends StatelessWidget {
  const ErrorView({
    required this.failure,
    super.key,
    this.onRetry,
  });

  final Failure failure;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final message = failure.when(
      server: (m) => m ?? 'Server error',
      network: (m) => m ?? 'No connection',
      unauthorized: (m) => m ?? 'Please sign in',
      cache: (m) => m ?? 'Cache error',
      unknown: (m) => m ?? 'Something went wrong',
    );

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 16),
              FilledButton(onPressed: onRetry, child: const Text('Retry')),
            ],
          ],
        ),
      ),
    );
  }
}
