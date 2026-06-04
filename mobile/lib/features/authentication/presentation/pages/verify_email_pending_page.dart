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
              'In local development, no real email is sent. '
              'Check the backend terminal for a line starting with '
              '"Verification email" and open that link in a browser. '
              'Then sign in.',
            ),
            const SizedBox(height: 12),
            const Text(
              'Or sign in directly — development mode auto-verifies '
              'your account on login.',
              style: TextStyle(fontSize: 13),
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
