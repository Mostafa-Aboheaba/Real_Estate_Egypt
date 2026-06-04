import { Controller, Get, Header } from '@nestjs/common';
import { RagMetricsService } from '../../infrastructure/observability/rag-metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly ragMetrics: RagMetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  metrics(): string {
    return this.ragMetrics.toPrometheus();
  }
}
