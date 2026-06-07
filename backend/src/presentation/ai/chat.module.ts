import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ChatService } from '../../application/chat/chat.service';
import { SafetyPipelineService } from '../../application/chat/safety-pipeline.service';
import { ToolExecutionLoopService } from '../../application/chat/tool-execution-loop.service';
import { CHAT_AGENT_CATALOG } from '../../domain/chat/ports/chat-agent-catalog.port';
import { CONVERSATION_REPOSITORY } from '../../domain/chat/ports/conversation.repository.port';
import { LLM_COMPLETION } from '../../domain/chat/ports/llm-completion.port';
import { GeminiOrchestratorService } from '../../infrastructure/ai/gemini-orchestrator.service';
import { PromptVersionResolver } from '../../infrastructure/ai/prompt-version.resolver';
import { PrismaChatAgentCatalog } from '../../infrastructure/persistence/chat/prisma-chat-agent-catalog';
import { PrismaConversationRepository } from '../../infrastructure/persistence/chat/prisma-conversation.repository';
import { ChatCompactionProcessor } from '../../infrastructure/queue/chat-compaction.processor';
import {
  CHAT_COMPACTION_QUEUE,
} from '../../infrastructure/queue/queue.constants';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { AuthModule } from '../auth/auth.module';
import { PropertiesModule } from '../properties/properties.module';
import { RagModule } from './rag.module';
import { AdminAgentsController } from './admin-agents.controller';
import { AiAgentsController } from './ai-agents.controller';
import { ChatStreamController } from './chat-stream.controller';
import { ConversationsController } from './conversations.controller';

@Module({
  imports: [
    QueueModule,
    AuthModule,
    PropertiesModule,
    RagModule,
    BullModule.registerQueue({ name: CHAT_COMPACTION_QUEUE }),
  ],
  controllers: [
    AiAgentsController,
    ConversationsController,
    ChatStreamController,
    AdminAgentsController,
  ],
  providers: [
    ChatService,
    SafetyPipelineService,
    ToolExecutionLoopService,
    PromptVersionResolver,
    GeminiOrchestratorService,
    ChatCompactionProcessor,
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: PrismaConversationRepository,
    },
    {
      provide: CHAT_AGENT_CATALOG,
      useClass: PrismaChatAgentCatalog,
    },
    { provide: LLM_COMPLETION, useClass: GeminiOrchestratorService },
  ],
  exports: [ChatService],
})
export class ChatModule {}
