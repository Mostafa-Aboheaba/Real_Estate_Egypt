import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/profile/data/datasources/remote/profile_api_service.dart';
import 'package:property_assistant/features/profile/data/mappers/profile_mapper.dart';
import 'package:property_assistant/features/profile/domain/entities/favorite_item.dart';
import 'package:property_assistant/features/profile/domain/entities/user_profile.dart';

@lazySingleton
class ProfileRemoteDataSource {
  ProfileRemoteDataSource(this._api);

  final ProfileApiService _api;

  Future<UserProfile> getMe() async {
    final dto = await _api.getMe();
    return ProfileMapper.toProfile(dto);
  }

  Future<UserProfile> patchMe(Map<String, dynamic> body) async {
    final dto = await _api.patchMe(body);
    return ProfileMapper.toProfile(dto);
  }

  Future<Map<String, dynamic>> patchPreferences(
    Map<String, dynamic> body,
  ) async {
    await _api.patchPreferences(body);
    return body;
  }

  Future<FavoritesPage> listFavorites({int page = 1, int limit = 20}) async {
    final dto = await _api.listFavorites({'page': page, 'limit': limit});
    return ProfileMapper.toFavoritesPage(dto);
  }

  Future<void> addFavorite(String propertyId) =>
      _api.addFavorite(propertyId);

  Future<void> removeFavorite(String propertyId) =>
      _api.removeFavorite(propertyId);
}
