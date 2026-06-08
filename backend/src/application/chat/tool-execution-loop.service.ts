import { Inject, Injectable, Logger } from '@nestjs/common';
import { PropertyType } from '../../domain/property/enums/property-type.enum';
import { RagOrchestratorService } from '../rag/rag-orchestrator.service';
import {
  PROPERTY_REPOSITORY,
  PropertyRepositoryPort,
} from '../../domain/property/ports/property.repository.port';
import { ListingRefProps } from '../../domain/chat/value-objects/listing-ref.vo';
import {
  isGreetingOrChitchat,
  isPropertySearchIntent,
  parseSearchIntent,
} from './search-intent.parser';

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

      let listingRefs = structured.items
        .filter((item) => this.matchesIntent(item, intent))
        .slice(0, 5)
        .map((item) => ({
          propertyId: item.id,
          title: item.title,
          priceEgp: item.priceEgp,
        }));

      if (listingRefs.length === 0) {
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

        listingRefs = [];
        for (const id of result.listingIds) {
          const property = await this.properties.findById(id);
          if (!property?.isActive) {
            continue;
          }
          if (!this.matchesPropertyIntent(property, intent)) {
            continue;
          }
          listingRefs.push({
            propertyId: property.id!,
            title: property.title,
            priceEgp: property.priceEgp,
          });
          if (listingRefs.length >= 5) {
            break;
          }
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
    if (isGreetingOrChitchat(userContent)) {
      return false;
    }
    return isPropertySearchIntent(userContent);
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
