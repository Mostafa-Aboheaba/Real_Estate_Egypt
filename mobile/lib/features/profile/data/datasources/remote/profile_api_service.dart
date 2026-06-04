import 'package:dio/dio.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:property_assistant/features/profile/data/models/favorites_page_dto.dart';
import 'package:property_assistant/features/profile/data/models/user_profile_dto.dart';
import 'package:retrofit/retrofit.dart';

part 'profile_api_service.g.dart';

@RestApi()
abstract class ProfileApiService {
  factory ProfileApiService(Dio dio) = _ProfileApiService;

  @GET(ApiConstants.usersMe)
  Future<UserProfileDto> getMe();

  @PATCH(ApiConstants.usersMe)
  Future<UserProfileDto> patchMe(@Body() Map<String, dynamic> body);

  @PATCH(ApiConstants.usersMePreferences)
  Future<void> patchPreferences(@Body() Map<String, dynamic> body);

  @GET(ApiConstants.usersMeFavorites)
  Future<FavoritesPageDto> listFavorites(
    @Queries() Map<String, dynamic> query,
  );

  @POST('${ApiConstants.usersMeFavorites}/{propertyId}')
  Future<void> addFavorite(@Path('propertyId') String propertyId);

  @DELETE('${ApiConstants.usersMeFavorites}/{propertyId}')
  Future<void> removeFavorite(@Path('propertyId') String propertyId);
}
