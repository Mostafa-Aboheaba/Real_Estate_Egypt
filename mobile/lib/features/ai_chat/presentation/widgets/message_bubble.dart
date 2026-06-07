import 'package:flutter/material.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_message.dart';
import 'package:property_assistant/features/ai_chat/presentation/widgets/listing_card_tile.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class MessageBubble extends StatelessWidget {
  const MessageBubble({super.key, required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isUser = message.isUser;
    final align = isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start;
    final color = isUser
        ? theme.colorScheme.primaryContainer
        : theme.colorScheme.surfaceContainerHighest;

    return Column(
      crossAxisAlignment: align,
      children: [
        Container(
          margin: const EdgeInsets.symmetric(vertical: 4),
          padding: const EdgeInsets.all(12),
          constraints: BoxConstraints(
            maxWidth: MediaQuery.sizeOf(context).width * 0.82,
          ),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(message.content + (message.isStreaming ? '▌' : '')),
              if (message.isAssistant) ...[
                const SizedBox(height: 8),
                Text(
                  l10n.chatAiDisclaimer,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ],
          ),
        ),
        if (message.listingRefs.isNotEmpty)
          ...message.listingRefs.map(
            (card) => ListingCardTile(card: card),
          ),
      ],
    );
  }
}
