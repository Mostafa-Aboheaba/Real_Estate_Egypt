import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/widgets/app_scaffold.dart';

/// Placeholder — full implementation in M3 Authentication.
class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Register',
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Registration — Milestone M3'),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => context.go(RoutePaths.login),
              child: const Text('Already have an account?'),
            ),
          ],
        ),
      ),
    );
  }
}
