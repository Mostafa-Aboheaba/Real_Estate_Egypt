import { A2uiSafetyValidator } from './a2ui-safety.validator';
import { UiSurfacePayload } from './a2ui-surface-builder.service';

describe('A2uiSafetyValidator', () => {
  const validator = new A2uiSafetyValidator();
  const allowed = new Set(['00000000-0000-4000-8000-000000000001']);

  const baseSurface = (): UiSurfacePayload => ({
    surfaceId: 'surface-1',
    catalogId: 'com.propertyassistant.chat',
    messages: [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'surface-1',
          catalogId: 'com.propertyassistant.chat',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'surface-1',
          components: [
            {
              id: 'root',
              component: 'PropertyCarousel',
              listings: [
                {
                  propertyId: '00000000-0000-4000-8000-000000000001',
                  title: 'Flat',
                  priceEgp: 500_000,
                  city: 'Maadi',
                },
              ],
            },
          ],
        },
      },
    ],
  });

  it('accepts allowed listings', () => {
    const result = validator.validate(baseSurface(), allowed);
    expect(result).not.toBeNull();
    expect(result?.messages).toHaveLength(2);
  });

  it('strips hallucinated property ids', () => {
    const surface = baseSurface();
    const update = surface.messages[1].updateComponents as {
      components: Array<Record<string, unknown>>;
    };
    update.components[0].listings = [
      {
        propertyId: '00000000-0000-4000-8000-000000000099',
        title: 'Bad',
        priceEgp: 1,
      },
    ];
    expect(validator.validate(surface, allowed)).toBeNull();
  });

  it('rejects unknown components', () => {
    const surface = baseSurface();
    const update = surface.messages[1].updateComponents as {
      components: Array<Record<string, unknown>>;
    };
    update.components[0].component = 'EvilWidget';
    expect(validator.validate(surface, allowed)).toBeNull();
  });
});
