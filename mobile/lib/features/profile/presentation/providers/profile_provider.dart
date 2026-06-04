import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/core/providers/locale_provider.dart';
import 'package:property_assistant/features/profile/domain/entities/favorite_item.dart';
import 'package:property_assistant/features/profile/domain/entities/user_profile.dart';
import 'package:property_assistant/features/profile/domain/repositories/profile_repository.dart';

final profileRepositoryProvider = Provider<ProfileRepository>(
  (ref) => getIt<ProfileRepository>(),
);

final userProfileProvider = AsyncNotifierProvider<UserProfileNotifier, UserProfile?>(
  UserProfileNotifier.new,
);

class UserProfileNotifier extends AsyncNotifier<UserProfile?> {
  @override
  Future<UserProfile?> build() async {
    return ref.read(profileRepositoryProvider).getMe();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(profileRepositoryProvider).getMe(),
    );
  }

  Future<void> saveProfile({
    String? name,
    String? phone,
    String? locale,
    String? preferredAgentId,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final profile = await ref.read(profileRepositoryProvider).updateProfile(
            name: name,
            phone: phone,
            locale: locale,
            preferredAgentId: preferredAgentId,
          );
      _applyLocale(ref, profile.locale);
      return profile;
    });
  }

  void _applyLocale(Ref ref, String apiLocale) {
    final locale = apiLocale.startsWith('ar')
        ? const Locale('ar', 'EG')
        : const Locale('en');
    ref.read(localeProvider.notifier).state = locale;
  }
}

final favoritesProvider =
    AsyncNotifierProvider<FavoritesNotifier, FavoritesPage?>(
  FavoritesNotifier.new,
);

class FavoritesNotifier extends AsyncNotifier<FavoritesPage?> {
  @override
  Future<FavoritesPage?> build() async {
    return ref.read(profileRepositoryProvider).listFavorites();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(profileRepositoryProvider).listFavorites(),
    );
  }
}

final isFavoriteProvider = Provider.family<bool, String>((ref, propertyId) {
  final favorites = ref.watch(favoritesProvider);
  return favorites.when(
    data: (page) =>
        page?.items.any((f) => f.propertyId == propertyId) ?? false,
    loading: () => false,
    error: (_, __) => false,
  );
});

Future<void> toggleFavorite(
  WidgetRef ref,
  String propertyId,
  bool currentlyFavorited,
) async {
  final repo = ref.read(profileRepositoryProvider);
  if (currentlyFavorited) {
    await repo.removeFavorite(propertyId);
  } else {
    await repo.addFavorite(propertyId);
  }
  ref.invalidate(favoritesProvider);
}
