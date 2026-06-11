import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:property_assistant/features/recommendation/domain/entities/recommendation_item.dart';
import 'package:property_assistant/features/recommendation/presentation/widgets/recommendation_card.dart';

void main() {
  testWidgets('dislike callback is wired', (tester) async {
    var disliked = false;
    const item = RecommendationItem(
      propertyId: 'id-1',
      score: 0.9,
      reasonStub: 'popular',
      title: 'Apartment in Zamalek',
      priceEgp: 14000,
      listingType: 'rent',
      propertyType: 'apartment',
      city: 'Cairo',
      area: 'Zamalek',
      thumbnailUrl: null,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: RecommendationCard(
            item: item,
            onTap: () {},
            onLike: () {},
            onDislike: () => disliked = true,
          ),
        ),
      ),
    );

    await tester.tap(find.byTooltip('Not for me'));
    await tester.pump();

    expect(disliked, isTrue);
  });
}
