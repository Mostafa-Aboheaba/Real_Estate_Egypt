class ListingCard {
  const ListingCard({
    required this.propertyId,
    required this.title,
    required this.priceEgp,
  });

  final String propertyId;
  final String title;
  final num priceEgp;
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    this.agentId,
    this.listingRefs = const [],
    this.uiSurface,
    this.isStreaming = false,
  });

  final String id;
  final String role;
  final String content;
  final String? agentId;
  final List<ListingCard> listingRefs;
  final Map<String, dynamic>? uiSurface;
  final bool isStreaming;

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';
}
