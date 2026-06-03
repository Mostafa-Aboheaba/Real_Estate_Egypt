import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/widgets/app_scaffold.dart';
import 'package:property_assistant/features/authentication/presentation/providers/auth_provider.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _role = 'buyer';
  bool _consent = false;
  bool _isLoading = false;
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
    if (!_consent) {
      setState(() => _errorMessage = 'Please accept the terms to continue.');
      return;
    }
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    final locale = Localizations.localeOf(context).languageCode == 'ar'
        ? 'ar-EG'
        : 'en';
    try {
      await ref.read(authRepositoryProvider).register(
            email: _emailController.text.trim(),
            password: _passwordController.text,
            role: _role,
            locale: locale,
            consentAccepted: _consent,
          );
      if (mounted) {
        context.go(RoutePaths.verifyEmailPending);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage =
              watchAuthFailure(e)?.message ?? 'Registration failed.';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Create account',
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
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                validator: (v) =>
                    v == null || !v.contains('@') ? 'Enter a valid email' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password (min 8 characters)',
                  border: OutlineInputBorder(),
                ),
                validator: (v) =>
                    v == null || v.length < 8 ? 'Min 8 characters' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _role,
                decoration: const InputDecoration(
                  labelText: 'I am a',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'buyer', child: Text('Buyer')),
                  DropdownMenuItem(value: 'agent', child: Text('Agent')),
                ],
                onChanged: (v) {
                  if (v != null) {
                    setState(() => _role = v);
                  }
                },
              ),
              const SizedBox(height: 16),
              CheckboxListTile(
                value: _consent,
                onChanged: (v) => setState(() => _consent = v ?? false),
                title: const Text('I accept the terms and privacy policy'),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Register'),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => context.go(RoutePaths.login),
                child: const Text('Already have an account? Sign in'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
