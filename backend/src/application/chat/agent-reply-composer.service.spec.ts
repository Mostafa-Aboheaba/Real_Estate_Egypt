import { AgentReplyComposerService } from './agent-reply-composer.service';
import { PropertyType } from '../../domain/property/enums/property-type.enum';

describe('AgentReplyComposerService', () => {
  const composer = new AgentReplyComposerService();

  it('composes a warm greeting without search', () => {
    const reply = composer.compose({
      locale: 'en',
      agentId: 'search-agent',
      userMessage: 'good morning',
      toolsInvoked: false,
      listings: [],
    });
    expect(reply).toContain('Good morning');
    expect(reply).toContain('Nadia');
    expect(reply).not.toContain('Here are options');
  });

  it('describes search results conversationally', () => {
    const reply = composer.compose({
      locale: 'en',
      agentId: 'search-agent',
      userMessage: 'apartment under 700k',
      toolsInvoked: true,
      intent: { textQuery: 'apartment', propertyType: PropertyType.Apartment, maxPriceEgp: 700_000 },
      listings: [
        {
          propertyId: '00000000-0000-4000-8000-000000000001',
          title: 'Cozy Maadi Flat',
          priceEgp: 650_000,
          city: 'Maadi',
          bedrooms: 2,
          propertyType: 'apartment',
        },
      ],
    });
    expect(reply).toContain('Cozy Maadi Flat');
    expect(reply).toContain('650K');
    expect(reply).toContain('viewing');
  });

  it('builds gemini context from listings', () => {
    const block = composer.buildGeminiContextBlock({
      locale: 'en',
      agentId: 'search-agent',
      userMessage: 'villa',
      toolsInvoked: true,
      listings: [
        {
          propertyId: '00000000-0000-4000-8000-000000000002',
          title: 'North Coast Villa',
          priceEgp: 5_000_000,
          city: 'Alexandria',
        },
      ],
    });
    expect(block).toContain('North Coast Villa');
    expect(block).toContain('SEARCH RESULTS');
  });
});
