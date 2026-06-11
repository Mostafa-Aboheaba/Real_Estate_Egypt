import { Inject, Injectable, Logger } from '@nestjs/common';
import { PropertyType } from '../../domain/property/enums/property-type.enum';
import { RagOrchestratorService } from '../rag/rag-orchestrator.service';
import {
  PROPERTY_REPOSITORY,
  PropertyRepositoryPort,
} from '../../domain/property/ports/property.repository.port';
import { ListingRefProps } from '../../domain/chat/value-objects/listing-ref.vo';
import { LlmMessage } from '../../domain/chat/ports/llm-completion.port';
import {
  isGreetingOrChitchat,
  isPropertySearchIntent,
  isSearchFollowUp,
  parseSearchIntent,
} from './search-intent.parser';
import { ListingNarration } from './agent-reply-composer.service';

export interface ToolRunResult {
  toolsCalled: string[];
  listingRefs: ListingRefProps[];
  listingNarrations: ListingNarration[];
  intent: ReturnType<typeof parseSearchIntent>;
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
    const intent = parseSearchIntent(query);

    try {
      const hasStructuredFilters =
        intent.propertyType != null ||
        intent.listingType != null ||
        intent.minPriceEgp != null ||
        intent.maxPriceEgp != null ||
        intent.city != null;

      const structured = await this.properties.search({
        q: hasStructuredFilters ? undefined : intent.textQuery,
        city: intent.city,
        propertyType: intent.propertyType,
        listingType: intent.listingType,
        minPrice: intent.minPriceEgp,
        maxPrice: intent.maxPriceEgp,
        page: 1,
        pageSize: 5,
        sort: 'newest',
      });

      let narrations = structured.items
        .filter((item) => this.matchesIntent(item, intent))
        .slice(0, 5)
        .map((item) => this.toNarration(item));

      if (narrations.length === 0) {
        const result = await this.rag.retrieve({
          query: intent.textQuery,
          topK: 8,
          filters: {
            includeFaq: false,
            city: intent.city,
            listingType: intent.listingType,
            propertyType: intent.propertyType,
            minPriceEgp: intent.minPriceEgp,
            maxPriceEgp: intent.maxPriceEgp,
          },
        });

        narrations = [];
        for (const id of result.listingIds) {
          const property = await this.properties.findById(id);
          if (!property?.isActive) {
            continue;
          }
          if (!this.matchesPropertyIntent(property, intent)) {
            continue;
          }
          narrations.push({
            propertyId: property.id!,
            title: property.title,
            priceEgp: property.priceEgp,
            city: property.location.city,
            propertyType: property.propertyType,
            bedrooms: property.bedrooms,
            listingType: property.listingType,
          });
          if (narrations.length >= 5) {
            break;
          }
        }
      }

      const listingRefs = narrations.map((item) => ({
        propertyId: item.propertyId,
        title: item.title,
        priceEgp: item.priceEgp,
      }));

      return {
        toolsCalled: ['semantic_search'],
        listingRefs,
        listingNarrations: narrations,
        intent,
        toolSummary: `${listingRefs.length} listings found`,
      };
    } catch (err) {
      this.logger.warn(`semantic_search failed: ${String(err)}`);
      const intent = parseSearchIntent(query);
      return {
        toolsCalled: ['semantic_search'],
        listingRefs: [],
        listingNarrations: [],
        intent,
        toolSummary: 'Search temporarily unavailable',
      };
    }
  }

  shouldInvokeTools(userContent: string, history: LlmMessage[] = []): boolean {
    if (isGreetingOrChitchat(userContent)) {
      return false;
    }
    if (isPropertySearchIntent(userContent)) {
      return true;
    }
    const recentContext = history
      .slice(-8)
      .map((message) => message.content)
      .join('\n');
    return isSearchFollowUp(userContent, recentContext);
  }

  private toNarration(item: {
    id: string;
    title: string;
    priceEgp: number;
    propertyType: string;
    listingType: string;
    bedrooms: number | null;
    location: { city: string };
  }): ListingNarration {
    return {
      propertyId: item.id,
      title: item.title,
      priceEgp: item.priceEgp,
      city: item.location.city,
      propertyType: item.propertyType,
      bedrooms: item.bedrooms,
      listingType: item.listingType,
    };
  }

  private matchesIntent(
    item: {
      propertyType: PropertyType;
      priceEgp: number;
    },
    intent: ReturnType<typeof parseSearchIntent>,
  ): boolean {
    if (intent.propertyType && item.propertyType !== intent.propertyType) {
      return false;
    }
    if (intent.minPriceEgp != null && item.priceEgp < intent.minPriceEgp) {
      return false;
    }
    if (intent.maxPriceEgp != null && item.priceEgp > intent.maxPriceEgp) {
      return false;
    }
    return true;
  }

  private matchesPropertyIntent(
    property: {
      propertyType: PropertyType;
      priceEgp: number;
    },
    intent: ReturnType<typeof parseSearchIntent>,
  ): boolean {
    return this.matchesIntent(property, intent);
  }
}
