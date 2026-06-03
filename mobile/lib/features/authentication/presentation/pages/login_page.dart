import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/widgets/app_scaffold.dart';

/// Placeholder — full implementation in M3 Authentication.
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Sign in',
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Authentication — Milestone M3'),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => context.go(RoutePaths.home),
              child: const Text('Back to home'),
            ),
          ],
        ),
      ),
    );
  }
}
