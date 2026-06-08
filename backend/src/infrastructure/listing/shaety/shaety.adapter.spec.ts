import { readFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ShaetyAdapter } from './shaety.adapter';
import { ShaetyGuestAuthService } from './shaety-guest-auth.service';

describe('ShaetyAdapter', () => {
  const mockListing = {
    id: 1,
    title: 'شقة للبيع',
    property_status: 'للبيع',
    property_price: 1_000_000,
    city: 'الإسكندرية',
  };

  const propertiesResponse = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      status: true,
      total: 1,
      per_page: 15,
      data: [mockListing],
    }),
  } as Response;

  const guestConfig = {
    get: (key: string) => {
      if (key === 'listing.shaetyApiUrl') {
        return 'https://app.shaety.com';
      }
      if (key === 'listing.shaetyApiKey') {
        return '';
      }
      if (key === 'listing.shaetyOsType') {
        return 'android';
      }
      return undefined;
    },
  } as unknown as ConfigService;

  function createAdapter(config: ConfigService = guestConfig): ShaetyAdapter {
    return new ShaetyAdapter(config, new ShaetyGuestAuthService(config));
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('bootstraps guest token via fcm-hash then fetches properties', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({
          status: true,
          data: { token: 'guest-token' },
        }),
      } as Response)
      .mockResolvedValueOnce(propertiesResponse);

    const listings = await createAdapter().fetchListings();

    expect(listings).toHaveLength(1);
    expect(listings[0]?.externalId).toBe('1');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [fcmUrl, fcmInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fcmUrl).toContain('/api/fcm-hash');
    expect(fcmInit.body).toBe('os_type=android');

    const [propsUrl, propsInit] = fetchMock.mock.calls[1] as [
      string,
      RequestInit,
    ];
    expect(propsUrl).toContain('/api/properties');
    expect(propsInit.redirect).toBe('manual');
    const headers = propsInit.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer guest-token');
  });

  it('uses SHAETY_API_KEY when set and skips fcm-hash', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(propertiesResponse);

    const config = {
      get: (key: string) => {
        if (key === 'listing.shaetyApiUrl') {
          return 'https://app.shaety.com';
        }
        if (key === 'listing.shaetyApiKey') {
          return 'test-token';
        }
        return undefined;
      },
    } as unknown as ConfigService;

    await createAdapter(config).fetchListings();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer test-token');
  });

  it('refreshes guest token on 401', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({
          status: true,
          data: { token: 'expired-token' },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers(),
        json: async () => ({ error: 'Unauthenticated.' }),
      } as Response)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({
          status: true,
          data: { token: 'fresh-token' },
        }),
      } as Response)
      .mockResolvedValueOnce(propertiesResponse);

    const listings = await createAdapter().fetchListings();

    expect(listings).toHaveLength(1);
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(4);
    const [, retryInit] = (global.fetch as jest.Mock).mock.calls[3] as [
      string,
      RequestInit,
    ];
    expect((retryInit.headers as Record<string, string>).Authorization).toBe(
      'Bearer fresh-token',
    );
  });

  it('falls back to mock listings on redirect', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 302,
      statusText: 'Found',
      headers: new Headers({
        location: 'https://app.shaety.com/users/sign_in',
      }),
      json: async () => ({}),
    } as Response);

    const config = { get: () => undefined } as unknown as ConfigService;
    const listings = await createAdapter(config).fetchListings();

    const mockPath = join(__dirname, 'mock-listings.json');
    const expected = JSON.parse(readFileSync(mockPath, 'utf-8')) as {
      externalId: string;
    }[];

    expect(listings).toHaveLength(expected.length);
    expect(listings[0]?.externalId).toBe(expected[0]?.externalId);
  });
});
