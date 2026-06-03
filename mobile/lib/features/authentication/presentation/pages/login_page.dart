import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/widgets/app_scaffold.dart';
import 'package:property_assistant/features/authentication/presentation/providers/auth_provider.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() => _errorMessage = null);
    await ref.read(authSessionProvider.notifier).login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
    final state = ref.read(authSessionProvider);
    if (state.hasError && mounted) {
      setState(() {
        _errorMessage = watchAuthFailure(state.error)?.message ??
            'Sign in failed. Check your email and password.';
      });
    } else if (state.hasValue && state.value != null && mounted) {
      context.go(RoutePaths.home);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authSessionProvider);
    final isLoading = auth.isLoading;

    return AppScaffold(
      title: 'Sign in',
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_errorMessage != null) ...[
                Text(
                  _errorMessage!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
                const SizedBox(height: 16),
              ],
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) {
                    return 'Enter your email';
                  }
                  if (!v.contains('@')) {
                    return 'Enter a valid email';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  if (v == null || v.length < 8) {
                    return 'Password must be at least 8 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => context.push(RoutePaths.forgotPassword),
                  child: const Text('Forgot password?'),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: isLoading ? null : _submit,
                child: isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Sign in'),
              ),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: isLoading
                    ? null
                    : () => _oauth(
                          () => ref
                              .read(authSessionProvider.notifier)
                              .signInWithGoogle(),
                        ),
                icon: const Icon(Icons.g_mobiledata, size: 28),
                label: const Text('Continue with Google'),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: isLoading
                    ? null
                    : () => _oauth(
                          () => ref
                              .read(authSessionProvider.notifier)
                              .signInWithApple(),
                        ),
                icon: const Icon(Icons.apple),
                label: const Text('Continue with Apple'),
              ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => context.go(RoutePaths.register),
                child: const Text('Create an account'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _oauth(Future<void> Function() action) async {
    setState(() => _errorMessage = null);
    await action();
    final state = ref.read(authSessionProvider);
    if (state.hasError && mounted) {
      setState(() {
        _errorMessage =
            watchAuthFailure(state.error)?.message ?? 'Sign in failed.';
      });
    } else if (state.hasValue && state.value != null && mounted) {
      context.go(RoutePaths.home);
    }
  }
}
