import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/ai_agent.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_message.dart';
import 'package:property_assistant/features/ai_chat/domain/repositories/chat_repository.dart';

final chatRepositoryProvider = Provider<ChatRepository>(
  (ref) => getIt<ChatRepository>(),
);

final aiAgentsProvider = FutureProvider<List<AiAgent>>((ref) async {
  return ref.read(chatRepositoryProvider).listAgents();
});

class ChatSessionState {
  const ChatSessionState({
    this.conversationId,
    this.agentId,
    this.messages = const [],
    this.isStreaming = false,
    this.error,
  });

  final String? conversationId;
  final String? agentId;
  final List<ChatMessage> messages;
  final bool isStreaming;
  final String? error;

  ChatSessionState copyWith({
    String? conversationId,
    String? agentId,
    List<ChatMessage>? messages,
    bool? isStreaming,
    String? error,
  }) {
    return ChatSessionState(
      conversationId: conversationId ?? this.conversationId,
      agentId: agentId ?? this.agentId,
      messages: messages ?? this.messages,
      isStreaming: isStreaming ?? this.isStreaming,
      error: error,
    );
  }
}

final chatSessionProvider =
    NotifierProvider<ChatSessionNotifier, ChatSessionState>(
  ChatSessionNotifier.new,
);

class ChatSessionNotifier extends Notifier<ChatSessionState> {
  @override
  ChatSessionState build() => const ChatSessionState();

  ChatRepository get _repo => ref.read(chatRepositoryProvider);

  Future<void> bootstrap({String? agentId}) async {
    state = state.copyWith(error: null);
    try {
      final id = await _repo.createConversation(agentId: agentId);
      final messages = await _repo.loadMessages(id);
      state = ChatSessionState(
        conversationId: id,
        agentId: agentId,
        messages: messages,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> switchAgent(String agentId) async {
    final convId = state.conversationId;
    if (convId == null) {
      return;
    }
    await _repo.switchAgent(convId, agentId);
    state = state.copyWith(agentId: agentId);
  }

  Future<void> send(String content) async {
    final convId = state.conversationId;
    if (convId == null || content.trim().isEmpty) {
      return;
    }

    final localId = _repo.newLocalId();

    final userMsg = ChatMessage(
      id: localId,
      role: 'user',
      content: content.trim(),
    );
    final streamingId = '${localId}_assistant';
    state = state.copyWith(
      messages: [
        ...state.messages,
        userMsg,
        ChatMessage(
          id: streamingId,
          role: 'assistant',
          content: '',
          isStreaming: true,
        ),
      ],
      isStreaming: true,
      error: null,
    );

    try {
      var buffer = '';
      Map<String, dynamic>? surface;
      await for (final chunk in _repo.streamMessage(convId, content)) {
        if (chunk.isText) {
          buffer += chunk.text!;
        }
        if (chunk.isSurface) {
          surface = chunk.uiSurface;
        }
        state = state.copyWith(
          messages: state.messages.map((m) {
            if (m.id == streamingId) {
              return ChatMessage(
                id: streamingId,
                role: 'assistant',
                content: buffer,
                uiSurface: surface,
                isStreaming: true,
              );
            }
            return m;
          }).toList(),
        );
      }

      final refreshed = await _repo.loadMessages(convId);
      state = state.copyWith(
        messages: refreshed,
        isStreaming: false,
      );
    } catch (e) {
      state = state.copyWith(
        isStreaming: false,
        error: e.toString(),
        messages: state.messages.where((m) => m.id != streamingId).toList(),
      );
    }
  }
}
