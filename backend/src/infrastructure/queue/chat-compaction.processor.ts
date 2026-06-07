import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  CONVERSATION_REPOSITORY,
  ConversationRepositoryPort,
} from '../../domain/chat/ports/conversation.repository.port';
import {
  CHAT_COMPACTION_JOB,
  CHAT_COMPACTION_QUEUE,
} from './queue.constants';

const KEEP_RECENT = 20;

@Processor(CHAT_COMPACTION_QUEUE)
export class ChatCompactionProcessor extends WorkerHost {
  private readonly logger = new Logger(ChatCompactionProcessor.name);

  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversations: ConversationRepositoryPort,
  ) {
    super();
  }

  async process(
    job: Job<{ conversationId: string; userId: string }>,
  ): Promise<void> {
    if (job.name !== CHAT_COMPACTION_JOB) {
      return;
    }

    const { conversationId, userId } = job.data;
    const conv = await this.conversations.findByIdForUser(
      conversationId,
      userId,
    );
    if (!conv) {
      return;
    }

    const messages = await this.conversations.getContextMessages(
      conversationId,
      200,
    );
    if (messages.length <= KEEP_RECENT) {
      return;
    }

    const older = messages.slice(0, messages.length - KEEP_RECENT);
    const summaryText = older
      .map((m) => `${m.role}: ${m.content.slice(0, 120)}`)
      .join('\n')
      .slice(0, 2000);
    const lastOlder = older[older.length - 1];
    if (!lastOlder) {
      return;
    }

    await this.conversations.update(conversationId, userId, {
      summary: {
        text: `Prior context summary:\n${summaryText}`,
        upToMessageId: lastOlder.id,
        version: 'memory-summarize-v1',
      },
    });
    this.logger.log(`Compacted conversation ${conversationId}`);
  }
}
