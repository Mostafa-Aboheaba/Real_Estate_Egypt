import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/features/authentication/presentation/providers/auth_provider.dart';
import 'package:property_assistant/features/recommendation/presentation/providers/recommendation_provider.dart';
import 'package:property_assistant/features/recommendation/presentation/widgets/recommendation_card.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class HomeRecommendationsSection extends ConsumerStatefulWidget {
  const HomeRecommendationsSection({super.key});

  @override
  ConsumerState<HomeRecommendationsSection> createState() =>
      _HomeRecommendationsSectionState();
}

class _HomeRecommendationsSectionState
    extends ConsumerState<HomeRecommendationsSection> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(recommendationProvider.notifier).load(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final session = ref.watch(authSessionProvider);
    final state = ref.watch(recommendationProvider);
    final feed = state.feed;

    if (state.isLoading && feed == null) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: LinearProgressIndicator(),
      );
    }

    if (feed == null || feed.items.isEmpty) {
      if (state.error != null) {
        return Text(state.error!);
      }
      return const SizedBox.shrink();
    }

    final title = feed.isPopular
        ? l10n.recommendationsPopularTitle
        : l10n.recommendationsPersonalizedTitle;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.titleLarge,
              ),
            ),
            if (session.valueOrNull != null)
              IconButton(
                tooltip: l10n.recommendationsRefresh,
                onPressed: state.isLoading
                    ? null
                    : () => ref
                        .read(recommendationProvider.notifier)
                        .load(refresh: true),
                icon: const Icon(Icons.refresh),
              ),
          ],
        ),
        if (feed.isPopular && session.valueOrNull == null) ...[
          const SizedBox(height: 4),
          Text(
            l10n.recommendationsGuestCta,
            style: Theme.of(context).textTheme.bodySmall,
          ),
          TextButton(
            onPressed: () => context.push(RoutePaths.login),
            child: Text(l10n.recommendationsSignIn),
          ),
        ],
        const SizedBox(height: 12),
        SizedBox(
          height: 320,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: feed.items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = feed.items[index];
              final notifier = ref.read(recommendationProvider.notifier);
              return RecommendationCard(
                item: item,
                onTap: () => context.push(
                  RoutePaths.propertyDetail(item.propertyId),
                ),
                onLike: session.valueOrNull == null
                    ? () => context.push(RoutePaths.login)
                    : () => notifier.like(item.propertyId),
                onDislike: session.valueOrNull == null
                    ? () => context.push(RoutePaths.login)
                    : () => notifier.dislike(item.propertyId),
              );
            },
          ),
        ),
      ],
    );
  }
}
