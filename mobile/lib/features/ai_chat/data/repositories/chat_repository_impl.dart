import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/ai_chat/data/datasources/chat_remote_datasource.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/ai_agent.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_message.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_stream_chunk.dart';
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
      uiSurface: _uiSurface(assistant['uiSurface']),
    );
  }

  @override
  Stream<ChatStreamChunk> streamMessage(
    String conversationId,
    String content,
  ) async* {
    await for (final event in _remote.streamMessage(conversationId, content)) {
      if (event.name == 'text_delta') {
        final text = event.data['text'];
        if (text is String && text.isNotEmpty) {
          yield ChatStreamChunk.text(text);
        }
      }
      if (event.name == 'a2ui_surface') {
        final a2ui = event.data['a2ui'];
        if (a2ui is Map<String, dynamic>) {
          yield ChatStreamChunk.surface(a2ui);
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

  Map<String, dynamic>? _uiSurface(dynamic raw) {
    if (raw is Map<String, dynamic>) {
      return raw;
    }
    return null;
  }

  @override
  String newLocalId() => _uuid.v4();
}
