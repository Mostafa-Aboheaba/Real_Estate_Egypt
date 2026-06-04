import 'package:property_assistant/features/profile/domain/entities/favorite_item.dart';
import 'package:property_assistant/features/profile/domain/entities/user_profile.dart';

abstract class ProfileRepository {
  Future<UserProfile> getMe();

  Future<UserProfile> updateProfile({
    String? name,
    String? phone,
    String? locale,
    String? preferredAgentId,
    Map<String, dynamic>? searchPreferences,
  });

  Future<Map<String, dynamic>> updateSearchPreferences(
    Map<String, dynamic> preferences,
  );

  Future<FavoritesPage> listFavorites({int page = 1, int limit = 20});

  Future<void> addFavorite(String propertyId);

  Future<void> removeFavorite(String propertyId);
}
