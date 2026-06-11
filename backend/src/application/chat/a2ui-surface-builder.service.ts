import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ListingNarration } from './agent-reply-composer.service';
import { PROPERTY_ASSISTANT_CATALOG_ID } from './a2ui-catalog.constants';

export interface UiSurfacePayload {
  surfaceId: string;
  catalogId: string;
  messages: Array<Record<string, unknown>>;
}

@Injectable()
export class A2uiSurfaceBuilderService {
  buildPropertyCarousel(listings: ListingNarration[]): UiSurfacePayload | null {
    if (listings.length === 0) {
      return null;
    }

    const surfaceId = `surface-${randomUUID()}`;
    const createSurface = {
      version: 'v0.9',
      createSurface: {
        surfaceId,
        catalogId: PROPERTY_ASSISTANT_CATALOG_ID,
      },
    };

    const updateComponents = {
      version: 'v0.9',
      updateComponents: {
        surfaceId,
        components: [
          {
            id: 'root',
            component: 'PropertyCarousel',
            listings: listings.map((listing) => ({
              propertyId: listing.propertyId,
              title: listing.title,
              priceEgp: listing.priceEgp,
              city: listing.city ?? '',
            })),
          },
        ],
      },
    };

    return {
      surfaceId,
      catalogId: PROPERTY_ASSISTANT_CATALOG_ID,
      messages: [createSurface, updateComponents],
    };
  }
}
