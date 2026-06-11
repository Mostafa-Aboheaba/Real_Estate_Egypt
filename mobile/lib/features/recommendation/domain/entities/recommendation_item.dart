class RecommendationItem {
  const RecommendationItem({
    required this.propertyId,
    required this.score,
    required this.reasonStub,
    required this.title,
    required this.priceEgp,
    required this.listingType,
    required this.propertyType,
    required this.city,
    required this.area,
    required this.thumbnailUrl,
  });

  final String propertyId;
  final double score;
  final String reasonStub;
  final String title;
  final num priceEgp;
  final String listingType;
  final String propertyType;
  final String city;
  final String area;
  final String? thumbnailUrl;

  String get locationLabel =>
      area.isNotEmpty ? '$area, $city' : city;
}

class RecommendationFeed {
  const RecommendationFeed({
    required this.title,
    required this.mode,
    required this.items,
    required this.page,
    required this.pageSize,
    required this.totalItems,
    required this.totalPages,
    required this.hasNext,
    this.ctaMessageKey,
    this.ctaAction,
  });

  final String title;
  final String mode;
  final List<RecommendationItem> items;
  final int page;
  final int pageSize;
  final int totalItems;
  final int totalPages;
  final bool hasNext;
  final String? ctaMessageKey;
  final String? ctaAction;

  bool get isPopular => mode == 'popular';
}
