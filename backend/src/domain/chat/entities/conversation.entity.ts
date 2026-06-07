export interface ConversationSummary {
  text: string;
  upToMessageId: string;
  version: string;
}

export interface ConversationProps {
  id?: string;
  userId: string;
  agentId: string;
  title?: string | null;
  isArchived?: boolean;
  lastMessageAt?: Date | null;
  summary?: ConversationSummary | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Conversation {
  readonly id?: string;
  readonly userId: string;
  readonly agentId: string;
  readonly title: string | null;
  readonly isArchived: boolean;
  readonly lastMessageAt: Date | null;
  readonly summary: ConversationSummary | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: ConversationProps) {
    if (!props.userId) {
      throw new Error('Conversation requires userId');
    }
    this.id = props.id;
    this.userId = props.userId;
    this.agentId = props.agentId;
    this.title = props.title ?? null;
    this.isArchived = props.isArchived ?? false;
    this.lastMessageAt = props.lastMessageAt ?? null;
    this.summary = props.summary ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  static create(userId: string, agentId: string, title?: string | null): Conversation {
    const safeTitle =
      title && title.trim().length > 0
        ? title.trim().slice(0, 200)
        : null;
    return new Conversation({
      userId,
      agentId,
      title: safeTitle,
    });
  }

  static reconstitute(props: ConversationProps): Conversation {
    return new Conversation(props);
  }
}
