import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SHAETY_DEFAULT_OS_TYPE,
  SHAETY_FCM_HASH_SEGMENT,
} from './shaety.constants';

interface ShaetyFcmHashResponse {
  status?: boolean;
  message?: string;
  data?: {
    token?: string;
    hash_id?: string;
  };
}

/** Guest Sanctum token via `POST /fcm-hash` (cached until invalidate / 401). */
@Injectable()
export class ShaetyGuestAuthService {
  private readonly logger = new Logger(ShaetyGuestAuthService.name);
  private cachedToken: string | null = null;

  constructor(private readonly config: ConfigService) {}

  invalidate(): void {
    this.cachedToken = null;
  }

  async getToken(apiRoot: string): Promise<string> {
    if (this.cachedToken) {
      return this.cachedToken;
    }
    const token = await this.fetchGuestToken(apiRoot);
    this.cachedToken = token;
    this.logger.log('Shaety guest token acquired via fcm-hash');
    return token;
  }

  private async fetchGuestToken(apiRoot: string): Promise<string> {
    const osType =
      this.config.get<string>('listing.shaetyOsType') ?? SHAETY_DEFAULT_OS_TYPE;
    const url = `${apiRoot}/${SHAETY_FCM_HASH_SEGMENT}`;
    const body = new URLSearchParams({ os_type: osType });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      redirect: 'manual',
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location') ?? 'unknown';
      throw new Error(
        `Shaety fcm-hash redirect ${response.status} → ${location}`,
      );
    }

    if (response.status < 200 || response.status >= 300) {
      const detail = await response.text();
      throw new Error(
        `Shaety fcm-hash ${response.status}: ${detail.slice(0, 200)}`,
      );
    }

    const payload = (await response.json()) as ShaetyFcmHashResponse;
    if (payload.status === false || !payload.data?.token) {
      throw new Error(
        payload.message ?? 'Shaety fcm-hash returned no guest token',
      );
    }

    return payload.data.token;
  }
}
