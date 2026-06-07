import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_message.dart';

class ListingCardTile extends StatelessWidget {
  const ListingCardTile({super.key, required this.card});

  final ListingCard card;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(top: 4, bottom: 4),
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
                  children: [
                    Text(
                      card.title,
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
