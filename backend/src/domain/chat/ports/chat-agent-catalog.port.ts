export const CHAT_AGENT_CATALOG = Symbol('CHAT_AGENT_CATALOG');

export interface ChatAgentDto {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

export interface ChatAgentCatalogPort {
  listActive(locale: string): Promise<ChatAgentDto[]>;
  resolveAgentId(
    requestedId: string | undefined,
    preferredUserAgentId: string | null,
  ): Promise<{ agentId: string; notice: string | null }>;
  getById(agentId: string): Promise<{
    id: string;
    modelId: string;
    isActive: boolean;
  } | null>;
  setActive(agentId: string, isActive: boolean): Promise<void>;
}
