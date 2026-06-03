import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/widgets/app_scaffold.dart';

/// Shown after registration while the user verifies email.
class VerifyEmailPendingPage extends StatelessWidget {
  const VerifyEmailPendingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Verify your email',
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'We sent a verification link to your email. '
              'Open the link, then sign in.',
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => context.go(RoutePaths.login),
              child: const Text('Go to sign in'),
            ),
          ],
        ),
      ),
    );
  }
}
