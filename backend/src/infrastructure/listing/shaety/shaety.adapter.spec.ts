import { readFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ShaetyAdapter } from './shaety.adapter';

describe('ShaetyAdapter', () => {
  const mockListing = {
    id: 1,
    title: 'شقة للبيع',
    property_status: 'للبيع',
    property_price: 1_000_000,
    city: 'الإسكندرية',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches listings via guest API matching mobile ApiClient', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        status: true,
        total: 1,
        per_page: 15,
        data: [mockListing],
      }),
    } as Response);

    const config = {
      get: (key: string) => {
        if (key === 'listing.shaetyApiUrl') {
          return 'https://shaety.pountech.com';
        }
        if (key === 'listing.shaetyApiKey') {
          return '';
        }
        return undefined;
      },
    } as unknown as ConfigService;

    const adapter = new ShaetyAdapter(config);
    const listings = await adapter.fetchListings();

    expect(listings).toHaveLength(1);
    expect(listings[0]?.externalId).toBe('1');
    expect(fetchMock).toHaveBeenCalled();
    const [requestUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestUrl).toContain('/api/properties');
    expect(init.redirect).toBe('manual');
    const headers = init.headers as Record<string, string>;
    expect(headers.Accept).toBe('application/json');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Authorization).toBeUndefined();
    expect(headers.Platform).toBeUndefined();
  });

  it('adds Bearer token when SHAETY_API_KEY is set', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        status: true,
        total: 1,
        per_page: 15,
        data: [mockListing],
      }),
    } as Response);

    const config = {
      get: (key: string) => {
        if (key === 'listing.shaetyApiUrl') {
          return 'https://shaety.pountech.com';
        }
        if (key === 'listing.shaetyApiKey') {
          return 'test-token';
        }
        return undefined;
      },
    } as unknown as ConfigService;

    const adapter = new ShaetyAdapter(config);
    await adapter.fetchListings();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer test-token');
  });

  it('falls back to mock listings on redirect (followRedirects: false)', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 302,
      statusText: 'Found',
      headers: new Headers({
        location: 'https://shaety.pountech.com/users/sign_in',
      }),
      json: async () => ({}),
    } as Response);

    const config = {
      get: (key: string) => undefined,
    } as unknown as ConfigService;

    const adapter = new ShaetyAdapter(config);
    const listings = await adapter.fetchListings();

    const mockPath = join(__dirname, 'mock-listings.json');
    const expected = JSON.parse(readFileSync(mockPath, 'utf-8')) as {
      externalId: string;
    }[];

    expect(listings).toHaveLength(expected.length);
    expect(listings[0]?.externalId).toBe(expected[0]?.externalId);
  });
});
