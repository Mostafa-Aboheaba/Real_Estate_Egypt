import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:property_assistant/core/network/api_response.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/ai_agent.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/chat_message.dart';

@lazySingleton
class ChatRemoteDataSource {
  ChatRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<AiAgent>> listAgents() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiConstants.aiAgents);
    final list = res.data?['data'];
    if (list is! List) {
      return [];
    }
    return list
        .whereType<Map<String, dynamic>>()
        .map(
          (row) => AiAgent(
            id: row['id'] as String,
            name: row['name'] as String? ?? row['id'] as String,
            description: row['description'] as String?,
            isDefault: row['isDefault'] as bool? ?? false,
          ),
        )
        .toList();
  }

  Future<String> createConversation({String? agentId}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiConstants.conversations,
      data: agentId == null ? {} : {'agentId': agentId},
    );
    final data = unwrapApiData(res.data);
    return data?['id'] as String;
  }

  Future<List<ChatMessage>> loadMessages(String conversationId) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '${ApiConstants.conversations}/$conversationId/messages',
    );
    final inner = res.data?['data'];
    if (inner is List) {
      return _mapMessages(inner);
    }
    if (inner is Map<String, dynamic> && inner['data'] is List) {
      return _mapMessages(inner['data'] as List);
    }
    return [];
  }

  List<ChatMessage> _mapMessages(List<dynamic> list) {
    return list
        .whereType<Map<String, dynamic>>()
        .map(
          (row) => ChatMessage(
            id: row['id'] as String,
            role: row['role'] as String,
            content: row['content'] as String,
            agentId: row['agentId'] as String?,
            listingRefs: _mapListingRefs(row['listingRefs']),
          ),
        )
        .toList();
  }

  List<ListingCard> _mapListingRefs(dynamic raw) {
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

  Future<Map<String, dynamic>> sendMessage(
    String conversationId,
    String content,
  ) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '${ApiConstants.conversations}/$conversationId/messages',
      data: {'content': content},
    );
    return unwrapApiData(res.data) ?? {};
  }

  Stream<ChatStreamEvent> streamMessage(
    String conversationId,
    String content,
  ) async* {
    final response = await _dio.post<ResponseBody>(
      '${ApiConstants.conversations}/$conversationId/messages/stream',
      data: {'content': content},
      options: Options(
        responseType: ResponseType.stream,
        headers: {'Accept': 'text/event-stream'},
      ),
    );

    final stream = response.data?.stream;
    if (stream == null) {
      return;
    }

    var buffer = '';
    await for (final chunk in stream) {
      buffer += utf8.decode(chunk);
      while (buffer.contains('\n\n')) {
        final index = buffer.indexOf('\n\n');
        final block = buffer.substring(0, index);
        buffer = buffer.substring(index + 2);
        final event = _parseSseBlock(block);
        if (event != null) {
          yield event;
        }
      }
    }
  }

  ChatStreamEvent? _parseSseBlock(String block) {
    var eventName = 'message';
    final dataLines = <String>[];
    for (final line in block.split('\n')) {
      if (line.startsWith('event:')) {
        eventName = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.add(line.substring(5).trim());
      }
    }
    if (dataLines.isEmpty) {
      return null;
    }
    final payload = jsonDecode(dataLines.join('\n')) as Map<String, dynamic>;
    return ChatStreamEvent(name: eventName, data: payload);
  }

  Future<void> patchAgent(String conversationId, String agentId) async {
    await _dio.patch<Map<String, dynamic>>(
      '${ApiConstants.conversations}/$conversationId',
      data: {'agentId': agentId},
    );
  }
}

class ChatStreamEvent {
  const ChatStreamEvent({required this.name, required this.data});

  final String name;
  final Map<String, dynamic> data;
}
