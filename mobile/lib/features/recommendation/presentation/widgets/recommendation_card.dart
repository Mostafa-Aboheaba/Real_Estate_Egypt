import 'package:flutter/material.dart';
import 'package:property_assistant/features/recommendation/domain/entities/recommendation_item.dart';

class RecommendationCard extends StatelessWidget {
  const RecommendationCard({
    required this.item,
    required this.onTap,
    required this.onLike,
    required this.onDislike,
    super.key,
  });

  final RecommendationItem item;
  final VoidCallback onTap;
  final VoidCallback onLike;
  final VoidCallback onDislike;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SizedBox(
      width: 260,
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (item.thumbnailUrl != null)
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.network(
                    item.thumbnailUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const ColoredBox(
                      color: Color(0xFFE0E0E0),
                      child: Icon(Icons.home_outlined, size: 48),
                    ),
                  ),
                )
              else
                const AspectRatio(
                  aspectRatio: 16 / 9,
                  child: ColoredBox(
                    color: Color(0xFFE0E0E0),
                    child: Icon(Icons.home_outlined, size: 48),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: theme.textTheme.titleSmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatPrice(item.priceEgp, item.listingType),
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.locationLabel,
                      style: theme.textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        IconButton(
                          tooltip: 'Like',
                          onPressed: onLike,
                          icon: const Icon(Icons.thumb_up_outlined),
                        ),
                        IconButton(
                          tooltip: 'Not for me',
                          onPressed: onDislike,
                          icon: const Icon(Icons.thumb_down_outlined),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatPrice(num price, String listingType) {
    final formatted = price >= 1000000
        ? '${(price / 1000000).toStringAsFixed(1)}M'
        : price >= 1000
            ? '${(price / 1000).toStringAsFixed(0)}K'
            : price.toStringAsFixed(0);
    final suffix = listingType == 'rent' ? ' EGP/mo' : ' EGP';
    return '$formatted$suffix';
  }
}
