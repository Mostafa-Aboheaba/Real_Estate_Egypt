import { Injectable } from '@nestjs/common';
import {
  ALLOWED_A2UI_COMPONENTS,
  PROPERTY_ASSISTANT_CATALOG_ID,
} from './a2ui-catalog.constants';
import { UiSurfacePayload } from './a2ui-surface-builder.service';

const DISCRIMINATORY_KEYS = [
  'religion',
  'ethnicity',
  'nationality',
  'race',
  'familyStatus',
  'christian',
  'muslim',
  'nationalityOnly',
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class A2uiSafetyValidator {
  validate(
    surface: UiSurfacePayload | null | undefined,
    allowedPropertyIds: Set<string>,
  ): UiSurfacePayload | null {
    if (!surface) {
      return null;
    }
    if (surface.catalogId !== PROPERTY_ASSISTANT_CATALOG_ID) {
      return null;
    }

    const sanitizedMessages: Array<Record<string, unknown>> = [];
    let hasComponents = false;
    for (const message of surface.messages) {
      const cleaned = this.sanitizeMessage(message, allowedPropertyIds);
      if (!cleaned) {
        if (message.updateComponents) {
          return null;
        }
        continue;
      }
      if (cleaned.updateComponents) {
        hasComponents = true;
      }
      sanitizedMessages.push(cleaned);
    }

    if (sanitizedMessages.length === 0 || !hasComponents) {
      return null;
    }

    return {
      surfaceId: surface.surfaceId,
      catalogId: surface.catalogId,
      messages: sanitizedMessages,
    };
  }

  private sanitizeMessage(
    message: Record<string, unknown>,
    allowedPropertyIds: Set<string>,
  ): Record<string, unknown> | null {
    const version = message.version;
    if (version !== 'v0.9') {
      return null;
    }

    if (message.createSurface && typeof message.createSurface === 'object') {
      return message;
    }

    const update = message.updateComponents;
    if (!update || typeof update !== 'object') {
      return message;
    }

    const raw = update as Record<string, unknown>;
    const components = raw.components;
    if (!Array.isArray(components)) {
      return null;
    }

    const safeComponents = components
      .map((component) =>
        this.sanitizeComponent(component as Record<string, unknown>, allowedPropertyIds),
      )
      .filter((component): component is Record<string, unknown> => component != null);

    if (safeComponents.length === 0) {
      return null;
    }

    return {
      version: 'v0.9',
      updateComponents: {
        ...raw,
        components: safeComponents,
      },
    };
  }

  private sanitizeComponent(
    component: Record<string, unknown>,
    allowedPropertyIds: Set<string>,
  ): Record<string, unknown> | null {
    const type = component.component;
    if (typeof type !== 'string' || !ALLOWED_A2UI_COMPONENTS.has(type)) {
      return null;
    }

    for (const key of Object.keys(component)) {
      if (DISCRIMINATORY_KEYS.some((blocked) => key.toLowerCase().includes(blocked))) {
        return null;
      }
    }

    if (type === 'PropertyCarousel' && Array.isArray(component.listings)) {
      const listings = (component.listings as Array<Record<string, unknown>>)
        .filter((listing) => {
          const id = listing.propertyId;
          return typeof id === 'string' && UUID_RE.test(id) && allowedPropertyIds.has(id);
        })
        .map((listing) => ({
          propertyId: listing.propertyId,
          title: String(listing.title ?? '').slice(0, 500),
          priceEgp: Number(listing.priceEgp) || 0,
          city: String(listing.city ?? '').slice(0, 120),
        }));

      if (listings.length === 0) {
        return null;
      }

      return {
        id: component.id ?? 'root',
        component: type,
        listings,
      };
    }

    return component;
  }
}
