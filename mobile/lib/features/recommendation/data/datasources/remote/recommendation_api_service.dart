import 'package:dio/dio.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:property_assistant/features/recommendation/data/models/recommendation_feed_dto.dart';
import 'package:retrofit/retrofit.dart';

part 'recommendation_api_service.g.dart';

@RestApi()
abstract class RecommendationApiService {
  factory RecommendationApiService(Dio dio) = _RecommendationApiService;

  @GET(ApiConstants.recommendations)
  Future<RecommendationFeedDto> getRecommendations(
    @Queries() Map<String, dynamic> query,
  );

  @POST(ApiConstants.recommendationsFeedback)
  Future<void> recordFeedback(@Body() Map<String, dynamic> body);
}
