import 'package:property_assistant/features/recommendation/data/models/recommendation_feed_dto.dart';
import 'package:property_assistant/features/recommendation/data/models/recommendation_item_dto.dart';
import 'package:property_assistant/features/recommendation/domain/entities/recommendation_item.dart';

class RecommendationMapper {
  static RecommendationFeed toFeed(RecommendationFeedDto dto) {
    return RecommendationFeed(
      title: dto.title,
      mode: dto.mode,
      items: dto.items.map(toItem).toList(),
      page: dto.pagination.page,
      pageSize: dto.pagination.pageSize,
      totalItems: dto.pagination.totalItems,
      totalPages: dto.pagination.totalPages,
      hasNext: dto.pagination.hasNext,
      ctaMessageKey: dto.cta?.messageKey,
      ctaAction: dto.cta?.action,
    );
  }

  static RecommendationItem toItem(RecommendationItemDto dto) {
    return RecommendationItem(
      propertyId: dto.propertyId,
      score: dto.score,
      reasonStub: dto.reasonStub,
      title: dto.listing.title,
      priceEgp: dto.listing.priceEgp,
      listingType: dto.listing.listingType,
      propertyType: dto.listing.propertyType,
      city: dto.listing.location.city,
      area: dto.listing.location.area,
      thumbnailUrl: dto.listing.thumbnailUrl,
    );
  }
}
