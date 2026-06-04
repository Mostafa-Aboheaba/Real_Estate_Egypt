import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/profile/data/datasources/remote/profile_remote_datasource.dart';
import 'package:property_assistant/features/profile/domain/entities/favorite_item.dart';
import 'package:property_assistant/features/profile/domain/entities/user_profile.dart';
import 'package:property_assistant/features/profile/domain/repositories/profile_repository.dart';

@LazySingleton(as: ProfileRepository)
class ProfileRepositoryImpl implements ProfileRepository {
  ProfileRepositoryImpl(this._remote);

  final ProfileRemoteDataSource _remote;

  @override
  Future<UserProfile> getMe() => _remote.getMe();

  @override
  Future<UserProfile> updateProfile({
    String? name,
    String? phone,
    String? locale,
    String? preferredAgentId,
    Map<String, dynamic>? searchPreferences,
  }) {
    final body = <String, dynamic>{};
    if (name != null) {
      body['name'] = name;
    }
    if (phone != null) {
      body['phone'] = phone;
    }
    if (locale != null) {
      body['locale'] = locale;
    }
    if (preferredAgentId != null) {
      body['preferredAgentId'] = preferredAgentId;
    }
    if (searchPreferences != null) {
      body['searchPreferences'] = searchPreferences;
    }
    return _remote.patchMe(body);
  }

  @override
  Future<Map<String, dynamic>> updateSearchPreferences(
    Map<String, dynamic> preferences,
  ) =>
      _remote.patchPreferences(preferences);

  @override
  Future<FavoritesPage> listFavorites({int page = 1, int limit = 20}) =>
      _remote.listFavorites(page: page, limit: limit);

  @override
  Future<void> addFavorite(String propertyId) =>
      _remote.addFavorite(propertyId);

  @override
  Future<void> removeFavorite(String propertyId) =>
      _remote.removeFavorite(propertyId);
}
