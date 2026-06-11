import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/recommendation/data/datasources/remote/recommendation_api_service.dart';
import 'package:property_assistant/features/recommendation/data/mappers/recommendation_mapper.dart';
import 'package:property_assistant/features/recommendation/domain/entities/recommendation_item.dart';

@lazySingleton
class RecommendationRemoteDataSource {
  RecommendationRemoteDataSource(this._api);

  final RecommendationApiService _api;

  Future<RecommendationFeed> getRecommendations({
    int page = 1,
    int pageSize = 10,
    bool refresh = false,
  }) async {
    final dto = await _api.getRecommendations({
      'page': page,
      'pageSize': pageSize,
      if (refresh) 'refresh': true,
    });
    return RecommendationMapper.toFeed(dto);
  }

  Future<void> recordFeedback({
    required String propertyId,
    required String sentiment,
  }) {
    return _api.recordFeedback({
      'propertyId': propertyId,
      'sentiment': sentiment,
    });
  }
}
