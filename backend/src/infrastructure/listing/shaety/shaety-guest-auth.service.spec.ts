import { ConfigService } from '@nestjs/config';
import { ShaetyGuestAuthService } from './shaety-guest-auth.service';

describe('ShaetyGuestAuthService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('obtains and caches guest token via fcm-hash with os_type', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({
          status: true,
          data: { token: 'guest-token-123', hash_id: 'abc' },
        }),
      } as Response);

    const config = {
      get: (key: string) =>
        key === 'listing.shaetyOsType' ? 'android' : undefined,
    } as unknown as ConfigService;

    const service = new ShaetyGuestAuthService(config);
    const token1 = await service.getToken('https://app.shaety.com/api');
    const token2 = await service.getToken('https://app.shaety.com/api');

    expect(token1).toBe('guest-token-123');
    expect(token2).toBe('guest-token-123');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://app.shaety.com/api/fcm-hash');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('os_type=android');
  });

  it('refetches after invalidate', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({
          status: true,
          data: { token: 'token-a' },
        }),
      } as Response)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({
          status: true,
          data: { token: 'token-b' },
        }),
      } as Response);

    const config = { get: () => undefined } as unknown as ConfigService;
    const service = new ShaetyGuestAuthService(config);

    expect(await service.getToken('https://app.shaety.com/api')).toBe('token-a');
    service.invalidate();
    expect(await service.getToken('https://app.shaety.com/api')).toBe('token-b');
  });
});
