export enum ListingProvider {
  Shaety = 'shaety',
  Aqarmap = 'aqarmap',
  PropertyFinder = 'property_finder',
}

export const PROVIDER_LABELS: Record<ListingProvider, string> = {
  [ListingProvider.Shaety]: 'Shaety — شقتي',
  [ListingProvider.Aqarmap]: 'Aqarmap',
  [ListingProvider.PropertyFinder]: 'Property Finder Egypt',
};
