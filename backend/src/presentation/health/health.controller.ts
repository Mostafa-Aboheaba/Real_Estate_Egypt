import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  liveness(): Promise<unknown> {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  readiness(): Promise<unknown> {
    return this.health.check([() => this.checkDatabase()]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    const up = await this.prisma.isHealthy();
    return {
      database: { status: up ? 'up' : 'down' },
    };
  }
}
