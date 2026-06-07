import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/features/ai_chat/domain/entities/ai_agent.dart';
import 'package:property_assistant/features/ai_chat/presentation/providers/chat_provider.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class AgentPickerSheet extends ConsumerWidget {
  const AgentPickerSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final agents = ref.watch(aiAgentsProvider);
    final selected = ref.watch(chatSessionProvider).agentId;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              l10n.chatSwitchAgent,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            agents.when(
              data: (list) => Column(
                children: list
                    .map(
                      (AiAgent agent) => ListTile(
                        title: Text(agent.name),
                        subtitle: agent.description == null
                            ? null
                            : Text(agent.description!),
                        trailing: selected == agent.id
                            ? const Icon(Icons.check)
                            : null,
                        onTap: () async {
                          await ref
                              .read(chatSessionProvider.notifier)
                              .switchAgent(agent.id);
                          if (context.mounted) {
                            Navigator.pop(context);
                          }
                        },
                      ),
                    )
                    .toList(),
              ),
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (e, _) => Text('$e'),
            ),
          ],
        ),
      ),
    );
  }
}
