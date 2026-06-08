import {
  isGreetingOrChitchat,
  isPropertySearchIntent,
  parseSearchIntent,
} from './search-intent.parser';
import { PropertyType } from '../../domain/property/enums/property-type.enum';

describe('search-intent.parser', () => {
  it('detects greetings', () => {
    expect(isGreetingOrChitchat('good morning')).toBe(true);
    expect(isGreetingOrChitchat('مرحبا')).toBe(true);
  });

  it('detects property search intent', () => {
    expect(isPropertySearchIntent('apartment in Maadi')).toBe(true);
    expect(isPropertySearchIntent('شقة للبيع')).toBe(true);
    expect(isPropertySearchIntent('good morning')).toBe(false);
  });

  it('parses apartment max price from natural language', () => {
    const intent = parseSearchIntent(
      'apartment in the cost range of 700,000',
    );
    expect(intent.propertyType).toBe(PropertyType.Apartment);
    expect(intent.maxPriceEgp).toBe(700_000);
  });
});
