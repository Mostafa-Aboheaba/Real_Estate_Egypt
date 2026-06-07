import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/ai_chat/data/datasources/chat_remote_datasource.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/ai_agent.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_message.dart';
import 'package:property_assistant/features/ai_chat/domain/repositories/chat_repository.dart';
import 'package:uuid/uuid.dart';

@LazySingleton(as: ChatRepository)
class ChatRepositoryImpl implements ChatRepository {
  ChatRepositoryImpl(this._remote);

  final ChatRemoteDataSource _remote;
  final _uuid = const Uuid();

  @override
  Future<List<AiAgent>> listAgents() => _remote.listAgents();

  @override
  Future<String> createConversation({String? agentId}) =>
      _remote.createConversation(agentId: agentId);

  @override
  Future<List<ChatMessage>> loadMessages(String conversationId) =>
      _remote.loadMessages(conversationId);

  @override
  Future<ChatMessage> sendMessage(
    String conversationId,
    String content,
  ) async {
    final data = await _remote.sendMessage(conversationId, content);
    final assistant = data['assistantMessage'] as Map<String, dynamic>?;
    if (assistant == null) {
      throw StateError('Missing assistant message');
    }
    return ChatMessage(
      id: assistant['id'] as String,
      role: 'assistant',
      content: assistant['content'] as String,
      agentId: assistant['agentId'] as String?,
      listingRefs: _refs(assistant['listingRefs']),
    );
  }

  @override
  Stream<String> streamMessage(String conversationId, String content) async* {
    await for (final event in _remote.streamMessage(conversationId, content)) {
      if (event.name == 'text_delta') {
        final text = event.data['text'];
        if (text is String && text.isNotEmpty) {
          yield text;
        }
      }
    }
  }

  @override
  Future<void> switchAgent(String conversationId, String agentId) =>
      _remote.patchAgent(conversationId, agentId);

  List<ListingCard> _refs(dynamic raw) {
    if (raw is! List) {
      return [];
    }
    return raw
        .whereType<Map<String, dynamic>>()
        .map(
          (r) => ListingCard(
            propertyId: r['propertyId'] as String,
            title: r['title'] as String? ?? '',
            priceEgp: r['priceEgp'] as num? ?? 0,
          ),
        )
        .toList();
  }

  @override
  String newLocalId() => _uuid.v4();
}
