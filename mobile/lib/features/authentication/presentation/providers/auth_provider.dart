import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/auth/session_expired_notifier.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/core/error/failure_mapper.dart';
import 'package:property_assistant/core/error/failures.dart';
import 'package:property_assistant/features/authentication/domain/entities/auth_session.dart';
import 'package:property_assistant/features/authentication/domain/repositories/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => getIt<AuthRepository>(),
);

/// Notifies [GoRouter] when auth state changes.
final authRouterRefreshProvider = Provider<ValueNotifier<int>>((ref) {
  final notifier = ValueNotifier(0);
  ref.onDispose(notifier.dispose);
  return notifier;
});

final authSessionProvider =
    AsyncNotifierProvider<AuthSessionNotifier, AuthSession?>(
  AuthSessionNotifier.new,
);

/// Clears session and refreshes router when token refresh fails.
final sessionExpiryListenerProvider = Provider<void>((ref) {
  final notifier = getIt<SessionExpiredNotifier>();
  final sub = notifier.onExpired.listen((_) {
    ref.read(authSessionProvider.notifier).clearSession();
  });
  ref.onDispose(sub.cancel);
});

class AuthSessionNotifier extends AsyncNotifier<AuthSession?> {
  @override
  Future<AuthSession?> build() async {
    ref.watch(sessionExpiryListenerProvider);
    return ref.read(authRepositoryProvider).restoreSession();
  }

  void clearSession() {
    state = const AsyncData(null);
    _notifyRouter();
  }

  void _notifyRouter() {
    ref.read(authRouterRefreshProvider).value++;
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await ref
          .read(authRepositoryProvider)
          .login(email: email, password: password);
      _notifyRouter();
      return session;
    });
  }

  Future<void> signInWithGoogle({String role = 'buyer'}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session =
          await ref.read(authRepositoryProvider).signInWithGoogle(role: role);
      _notifyRouter();
      return session;
    });
  }

  Future<void> signInWithApple({String role = 'buyer'}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session =
          await ref.read(authRepositoryProvider).signInWithApple(role: role);
      _notifyRouter();
      return session;
    });
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(null);
    _notifyRouter();
  }
}

/// Last auth failure for UI error banners.
final authFailureProvider = StateProvider<Failure?>((ref) => null);

Failure? watchAuthFailure(Object? error) {
  if (error == null) {
    return null;
  }
  return mapExceptionToFailure(error);
}
