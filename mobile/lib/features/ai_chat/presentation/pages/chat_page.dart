import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/widgets/app_scaffold.dart';
import 'package:property_assistant/features/ai_chat/presentation/providers/chat_provider.dart';
import 'package:property_assistant/features/ai_chat/presentation/widgets/agent_picker_sheet.dart';
import 'package:property_assistant/features/ai_chat/presentation/widgets/message_bubble.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class ChatPage extends ConsumerStatefulWidget {
  const ChatPage({super.key, this.initialAgentId});

  final String? initialAgentId;

  @override
  ConsumerState<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends ConsumerState<ChatPage> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref
          .read(chatSessionProvider.notifier)
          .bootstrap(agentId: widget.initialAgentId),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final session = ref.watch(chatSessionProvider);

    ref.listen(chatSessionProvider, (_, __) => _scrollToEnd());

    return AppScaffold(
      title: l10n.chatTitle,
      actions: [
        IconButton(
          icon: const Icon(Icons.smart_toy_outlined),
          tooltip: l10n.chatSwitchAgent,
          onPressed: () => showModalBottomSheet<void>(
            context: context,
            builder: (_) => const AgentPickerSheet(),
          ),
        ),
      ],
      body: Column(
        children: [
          if (session.error != null)
            MaterialBanner(
              content: Text(session.error!),
              actions: [
                TextButton(
                  onPressed: () => ref
                      .read(chatSessionProvider.notifier)
                      .bootstrap(agentId: widget.initialAgentId),
                  child: Text(l10n.chatRetry),
                ),
              ],
            ),
          Expanded(
            child: session.conversationId == null
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: session.messages.length,
                    itemBuilder: (context, index) {
                      final msg = session.messages[index];
                      return Align(
                        alignment: msg.isUser
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: MessageBubble(message: msg),
                      );
                    },
                  ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    minLines: 1,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: l10n.chatInputHint,
                      border: const OutlineInputBorder(),
                    ),
                    onSubmitted: session.isStreaming ? null : _send,
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: session.isStreaming ? null : _send,
                  child: Icon(
                    session.isStreaming ? Icons.hourglass_top : Icons.send,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _send([String? value]) async {
    final text = (value ?? _controller.text).trim();
    if (text.isEmpty) {
      return;
    }
    _controller.clear();
    await ref.read(chatSessionProvider.notifier).send(text);
  }
}
