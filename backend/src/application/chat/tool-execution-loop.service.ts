import { Inject, Injectable, Logger } from '@nestjs/common';
import { RagOrchestratorService } from '../rag/rag-orchestrator.service';
import {
  PROPERTY_REPOSITORY,
  PropertyRepositoryPort,
} from '../../domain/property/ports/property.repository.port';
import { ListingRefProps } from '../../domain/chat/value-objects/listing-ref.vo';

export interface ToolRunResult {
  toolsCalled: string[];
  listingRefs: ListingRefProps[];
  toolSummary: string;
}

@Injectable()
export class ToolExecutionLoopService {
  private readonly logger = new Logger(ToolExecutionLoopService.name);

  constructor(
    private readonly rag: RagOrchestratorService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly properties: PropertyRepositoryPort,
  ) {}

  async runSemanticSearch(query: string): Promise<ToolRunResult> {
    try {
      const result = await this.rag.retrieve({
        query,
        topK: 5,
        filters: { includeFaq: true },
      });

      const listingRefs: ListingRefProps[] = [];
      for (const id of result.listingIds.slice(0, 5)) {
        const property = await this.properties.findById(id);
        if (property?.isActive) {
          listingRefs.push({
            propertyId: property.id!,
            title: property.title,
            priceEgp: property.priceEgp,
          });
        }
      }

      return {
        toolsCalled: ['semantic_search'],
        listingRefs,
        toolSummary: `${listingRefs.length} listings found`,
      };
    } catch (err) {
      this.logger.warn(`semantic_search failed: ${String(err)}`);
      return {
        toolsCalled: ['semantic_search'],
        listingRefs: [],
        toolSummary: 'Search temporarily unavailable',
      };
    }
  }

  shouldInvokeTools(userContent: string): boolean {
    const lower = userContent.toLowerCase();
    const triggers = [
      'apartment',
      'villa',
      'rent',
      'buy',
      'property',
      'شقة',
      'فيلا',
      'إيجار',
      'شراء',
      'عقار',
      'maadi',
      'zamalek',
      'new cairo',
    ];
    return triggers.some((t) => lower.includes(t));
  }
}
