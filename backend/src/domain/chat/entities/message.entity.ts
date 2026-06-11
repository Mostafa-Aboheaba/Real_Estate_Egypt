import { ListingRef, ListingRefProps } from '../value-objects/listing-ref.vo';
import { MessageRole, MessageRoleValue } from '../value-objects/message-role.vo';

export interface MessageMetadata {
  toolsCalled?: string[];
  latencyMs?: number;
  model?: string;
  promptVersion?: string;
  safetyBlocked?: boolean;
}

export interface UiSurfacePayload {
  surfaceId: string;
  catalogId: string;
  messages: Array<Record<string, unknown>>;
}

export interface MessageProps {
  id?: string;
  conversationId: string;
  role: MessageRoleValue;
  content: string;
  agentId?: string | null;
  listingRefs?: ListingRefProps[];
  uiSurface?: UiSurfacePayload | null;
  metadata?: MessageMetadata | null;
  tokenCount?: number | null;
  createdAt?: Date;
}

export class Message {
  readonly id?: string;
  readonly conversationId: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly agentId: string | null;
  readonly listingRefs: ListingRef[];
  readonly uiSurface: UiSurfacePayload | null;
  readonly metadata: MessageMetadata | null;
  readonly tokenCount: number | null;
  readonly createdAt: Date;

  private constructor(props: MessageProps, role: MessageRole) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.role = role;
    this.content = props.content;
    this.agentId = props.agentId ?? null;
    this.listingRefs = (props.listingRefs ?? [])
      .map((r) => ListingRef.create(r))
      .filter((r): r is ListingRef => r != null);
    this.uiSurface = props.uiSurface ?? null;
    this.metadata = props.metadata ?? null;
    this.tokenCount = props.tokenCount ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  static createUser(
    conversationId: string,
    content: string,
  ): Message | null {
    const trimmed = content.trim();
    if (trimmed.length === 0 || trimmed.length > 4000) {
      return null;
    }
    return new Message(
      {
        conversationId,
        role: 'user',
        content: trimmed,
      },
      MessageRole.user(),
    );
  }

  static createAssistant(
    conversationId: string,
    content: string,
    agentId: string,
    listingRefs: ListingRefProps[],
    metadata?: MessageMetadata,
    uiSurface?: UiSurfacePayload | null,
  ): Message | null {
    const trimmed = content.trim();
    if (trimmed.length === 0 || trimmed.length > 8000) {
      return null;
    }
    if (!agentId) {
      return null;
    }
    return new Message(
      {
        conversationId,
        role: 'assistant',
        content: trimmed,
        agentId,
        listingRefs,
        uiSurface,
        metadata,
      },
      MessageRole.assistant(),
    );
  }
}
