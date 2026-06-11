import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/recommendation/data/datasources/remote/recommendation_remote_datasource.dart';
import 'package:property_assistant/features/recommendation/domain/entities/recommendation_item.dart';
import 'package:property_assistant/features/recommendation/domain/repositories/recommendation_repository.dart';

@LazySingleton(as: RecommendationRepository)
class RecommendationRepositoryImpl implements RecommendationRepository {
  RecommendationRepositoryImpl(this._remote);

  final RecommendationRemoteDataSource _remote;

  @override
  Future<RecommendationFeed> getRecommendations({
    int page = 1,
    int pageSize = 10,
    bool refresh = false,
  }) {
    return _remote.getRecommendations(
      page: page,
      pageSize: pageSize,
      refresh: refresh,
    );
  }

  @override
  Future<void> recordFeedback({
    required String propertyId,
    required String sentiment,
  }) {
    return _remote.recordFeedback(
      propertyId: propertyId,
      sentiment: sentiment,
    );
  }
}
