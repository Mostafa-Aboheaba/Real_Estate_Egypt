/// Viewing booking returned from the API.
class Booking {
  const Booking({
    required this.id,
    required this.status,
    required this.propertyId,
    required this.agentId,
    required this.buyerId,
    required this.preferredAt,
    this.scheduledAt,
    this.buyerMessage,
    this.agentMessage,
    this.propertyTitle,
    this.thumbnailUrl,
  });

  final String id;
  final String status;
  final String propertyId;
  final String agentId;
  final String buyerId;
  final DateTime preferredAt;
  final DateTime? scheduledAt;
  final String? buyerMessage;
  final String? agentMessage;
  final String? propertyTitle;
  final String? thumbnailUrl;
}
