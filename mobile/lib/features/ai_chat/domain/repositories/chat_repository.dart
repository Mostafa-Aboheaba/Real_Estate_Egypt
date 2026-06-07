import 'package:property_assistant/features/ai_chat/domain/entities/ai_agent.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_message.dart';

abstract class ChatRepository {
  Future<List<AiAgent>> listAgents();

  Future<String> createConversation({String? agentId});

  Future<List<ChatMessage>> loadMessages(String conversationId);

  Future<ChatMessage> sendMessage(
    String conversationId,
    String content,
  );

  Stream<String> streamMessage(String conversationId, String content);

  Future<void> switchAgent(String conversationId, String agentId);

  String newLocalId();
}
