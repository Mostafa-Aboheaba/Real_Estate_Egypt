import 'package:property_assistant/features/recommendation/domain/entities/recommendation_item.dart';

abstract class RecommendationRepository {
  Future<RecommendationFeed> getRecommendations({
    int page = 1,
    int pageSize = 10,
    bool refresh = false,
  });

  Future<void> recordFeedback({
    required String propertyId,
    required String sentiment,
  });
}
