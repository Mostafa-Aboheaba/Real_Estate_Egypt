import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/features/recommendation/domain/entities/recommendation_item.dart';
import 'package:property_assistant/features/recommendation/domain/repositories/recommendation_repository.dart';

final recommendationRepositoryProvider = Provider<RecommendationRepository>(
  (ref) => getIt<RecommendationRepository>(),
);

class RecommendationState {
  const RecommendationState({
    this.feed,
    this.isLoading = false,
    this.isSubmittingFeedback = false,
    this.error,
  });

  final RecommendationFeed? feed;
  final bool isLoading;
  final bool isSubmittingFeedback;
  final String? error;

  RecommendationState copyWith({
    RecommendationFeed? feed,
    bool? isLoading,
    bool? isSubmittingFeedback,
    String? error,
    bool clearError = false,
  }) {
    return RecommendationState(
      feed: feed ?? this.feed,
      isLoading: isLoading ?? this.isLoading,
      isSubmittingFeedback:
          isSubmittingFeedback ?? this.isSubmittingFeedback,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final recommendationProvider =
    NotifierProvider<RecommendationNotifier, RecommendationState>(
  RecommendationNotifier.new,
);

class RecommendationNotifier extends Notifier<RecommendationState> {
  @override
  RecommendationState build() => const RecommendationState();

  RecommendationRepository get _repo =>
      ref.read(recommendationRepositoryProvider);

  Future<void> load({bool refresh = false}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final feed = await _repo.getRecommendations(refresh: refresh);
      state = state.copyWith(feed: feed, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> like(String propertyId) async {
    await _submitFeedback(propertyId, 'like', refreshAfter: true);
  }

  Future<void> dislike(String propertyId) async {
    final current = state.feed;
    if (current != null) {
      final filtered = current.items
          .where((item) => item.propertyId != propertyId)
          .toList();
      state = state.copyWith(
        feed: RecommendationFeed(
          title: current.title,
          mode: current.mode,
          items: filtered,
          page: current.page,
          pageSize: current.pageSize,
          totalItems: current.totalItems,
          totalPages: current.totalPages,
          hasNext: current.hasNext,
          ctaMessageKey: current.ctaMessageKey,
          ctaAction: current.ctaAction,
        ),
      );
    }
    await _submitFeedback(propertyId, 'dislike', refreshAfter: false);
  }

  Future<void> _submitFeedback(
    String propertyId,
    String sentiment, {
    required bool refreshAfter,
  }) async {
    state = state.copyWith(isSubmittingFeedback: true, clearError: true);
    try {
      await _repo.recordFeedback(
        propertyId: propertyId,
        sentiment: sentiment,
      );
      if (refreshAfter) {
        await load(refresh: true);
      } else {
        state = state.copyWith(isSubmittingFeedback: false);
      }
    } catch (e) {
      state = state.copyWith(
        isSubmittingFeedback: false,
        error: e.toString(),
      );
    }
  }
}
