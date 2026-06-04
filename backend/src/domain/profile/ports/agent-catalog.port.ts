export const AGENT_CATALOG = Symbol('AGENT_CATALOG');

export interface AgentCatalogPort {
  isActiveAgentId(agentId: string): Promise<boolean>;
}
