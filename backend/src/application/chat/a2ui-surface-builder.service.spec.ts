import { A2uiSurfaceBuilderService } from './a2ui-surface-builder.service';

describe('A2uiSurfaceBuilderService', () => {
  const builder = new A2uiSurfaceBuilderService();

  it('builds PropertyCarousel surface messages', () => {
    const surface = builder.buildPropertyCarousel([
      {
        propertyId: '00000000-0000-4000-8000-000000000001',
        title: 'Maadi Flat',
        priceEgp: 650_000,
        city: 'Maadi',
      },
    ]);

    expect(surface).not.toBeNull();
    expect(surface?.messages).toHaveLength(2);
    expect(surface?.messages[1].updateComponents).toBeDefined();
  });
});
