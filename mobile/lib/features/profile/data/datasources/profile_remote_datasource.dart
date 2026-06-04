import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:property_assistant/core/network/api_client.dart';
import 'package:property_assistant/core/network/api_response.dart';
import 'package:property_assistant/features/profile/domain/entities/favorite_item.dart';
import 'package:property_assistant/features/profile/domain/entities/user_profile.dart';

@lazySingleton
class ProfileRemoteDataSource {
  ProfileRemoteDataSource(this._client);

  final ApiClient _client;

  Future<UserProfile> getMe() async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.usersMe,
    );
    final data = unwrapApiData(response.data);
    if (data == null) {
      throw const FormatException('Invalid /users/me response');
    }
    return UserProfile.fromJson(data);
  }

  Future<UserProfile> patchMe(Map<String, dynamic> body) async {
    final response = await _client.patch<Map<String, dynamic>>(
      ApiConstants.usersMe,
      data: body,
    );
    final data = unwrapApiData(response.data);
    if (data == null) {
      throw const FormatException('Invalid PATCH /users/me response');
    }
    return UserProfile.fromJson(data);
  }

  Future<Map<String, dynamic>> patchPreferences(
    Map<String, dynamic> body,
  ) async {
    final response = await _client.patch<Map<String, dynamic>>(
      ApiConstants.usersMePreferences,
      data: body,
    );
    final data = unwrapApiData(response.data);
    return data ?? {};
  }

  Future<FavoritesPage> listFavorites({int page = 1, int limit = 20}) async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.usersMeFavorites,
      queryParameters: {'page': page, 'limit': limit},
    );
    final data = unwrapApiData(response.data);
    if (data == null) {
      throw const FormatException('Invalid favorites response');
    }
    return FavoritesPage.fromJson(data);
  }

  Future<void> addFavorite(String propertyId) async {
    await _client.post<void>(
      '${ApiConstants.usersMeFavorites}/$propertyId',
    );
  }

  Future<void> removeFavorite(String propertyId) async {
    await _client.delete<void>(
      '${ApiConstants.usersMeFavorites}/$propertyId',
    );
  }
}
