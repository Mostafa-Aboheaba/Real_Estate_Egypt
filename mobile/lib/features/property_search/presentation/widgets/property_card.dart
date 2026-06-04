import 'package:flutter/material.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_list_item.dart';

class PropertyCard extends StatelessWidget {
  const PropertyCard({
    required this.item,
    required this.onTap,
    super.key,
  });

  final PropertyListItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
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
                    style: theme.textTheme.titleMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatPrice(item.priceEgp, item.listingType),
                    style: theme.textTheme.titleSmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.location.shortLabel,
                    style: theme.textTheme.bodySmall,
                  ),
                  if (item.bedrooms != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      '${item.bedrooms} bed · ${item.bathrooms ?? '-'} bath',
                      style: theme.textTheme.labelSmall,
                    ),
                  ],
                ],
              ),
            ),
          ],
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
