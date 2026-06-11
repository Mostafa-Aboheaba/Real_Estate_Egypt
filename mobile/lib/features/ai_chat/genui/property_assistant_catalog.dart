import 'package:flutter/material.dart';
import 'package:genui/genui.dart';
import 'package:go_router/go_router.dart';
import 'package:json_schema_builder/json_schema_builder.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_message.dart';

const propertyAssistantCatalogId = 'com.propertyassistant.chat';

Catalog propertyAssistantCatalog() {
  return Catalog(
    [
      propertyCarouselItem,
      propertyCardItem,
      primaryButtonItem,
    ],
    catalogId: propertyAssistantCatalogId,
  );
}

final propertyCarouselItem = CatalogItem(
  name: 'PropertyCarousel',
  dataSchema: S.object(
    properties: {
      'listings': S.list(
        items: S.object(
          properties: {
            'propertyId': S.string(),
            'title': S.string(),
            'priceEgp': S.number(),
            'city': S.string(),
          },
          required: ['propertyId', 'title', 'priceEgp'],
        ),
      ),
    },
    required: ['listings'],
  ),
  widgetBuilder: (context) {
    final listings = context.data;
    if (listings is! Map<String, dynamic>) {
      return const SizedBox.shrink();
    }
    final raw = listings['listings'];
    if (raw is! List) {
      return const SizedBox.shrink();
    }

    final cards = raw
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => ListingCard(
            propertyId: item['propertyId'] as String? ?? '',
            title: item['title'] as String? ?? '',
            priceEgp: item['priceEgp'] as num? ?? 0,
          ),
        )
        .toList();

    return SizedBox(
      height: 120,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: cards.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final card = cards[index];
          return SizedBox(
            width: 280,
            child: _PropertyCardTile(card: card),
          );
        },
      ),
    );
  },
);

final propertyCardItem = CatalogItem(
  name: 'PropertyCard',
  dataSchema: S.object(
    properties: {
      'propertyId': S.string(),
      'title': S.string(),
      'priceEgp': S.number(),
      'city': S.string(),
    },
    required: ['propertyId', 'title', 'priceEgp'],
  ),
  widgetBuilder: (context) {
    final data = context.data;
    if (data is! Map<String, dynamic>) {
      return const SizedBox.shrink();
    }
    return _PropertyCardTile(
      card: ListingCard(
        propertyId: data['propertyId'] as String? ?? '',
        title: data['title'] as String? ?? '',
        priceEgp: data['priceEgp'] as num? ?? 0,
      ),
    );
  },
);

final primaryButtonItem = CatalogItem(
  name: 'PrimaryButton',
  dataSchema: S.object(
    properties: {
      'label': S.string(),
      'action': S.string(),
    },
    required: ['label'],
  ),
  widgetBuilder: (context) {
    final data = context.data;
    if (data is! Map<String, dynamic>) {
      return const SizedBox.shrink();
    }
    return FilledButton(
      onPressed: () {},
      child: Text(data['label'] as String? ?? ''),
    );
  },
);

class _PropertyCardTile extends StatelessWidget {
  const _PropertyCardTile({required this.card});

  final ListingCard card;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: InkWell(
        onTap: () => context.push(RoutePaths.propertyDetail(card.propertyId)),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              const Icon(Icons.home_outlined),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      card.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleSmall,
                    ),
                    Text(
                      '${card.priceEgp} EGP',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}
