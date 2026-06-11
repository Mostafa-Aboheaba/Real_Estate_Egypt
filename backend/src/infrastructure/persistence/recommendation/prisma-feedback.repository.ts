import { Injectable } from '@nestjs/common';
import { FeedbackSentiment as PrismaSentiment } from '@prisma/client';
import {
  FeedbackRecord,
  FeedbackRepositoryPort,
} from '../../../domain/recommendation/ports/feedback.repository.port';
import { FeedbackSentiment } from '../../../domain/recommendation/value-objects/feedback-sentiment.vo';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaFeedbackRepository implements FeedbackRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    propertyId: string,
    sentiment: FeedbackSentiment,
  ): Promise<{ record: FeedbackRecord; created: boolean }> {
    const existing = await this.prisma.listingFeedback.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    const row = await this.prisma.listingFeedback.upsert({
      where: {
        userId_propertyId: { userId, propertyId },
      },
      create: {
        userId,
        propertyId,
        sentiment: sentiment as PrismaSentiment,
      },
      update: {
        sentiment: sentiment as PrismaSentiment,
      },
    });

    return {
      record: this.toRecord(row),
      created: !existing,
    };
  }

  async listByUser(userId: string): Promise<FeedbackRecord[]> {
    const rows = await this.prisma.listingFeedback.findMany({
      where: { userId },
    });
    return rows.map((r) => this.toRecord(r));
  }

  async listDislikedPropertyIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.listingFeedback.findMany({
      where: { userId, sentiment: 'dislike' },
      select: { propertyId: true },
    });
    return rows.map((r) => r.propertyId);
  }

  async listLikedPropertyIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.listingFeedback.findMany({
      where: { userId, sentiment: 'like' },
      select: { propertyId: true },
    });
    return rows.map((r) => r.propertyId);
  }

  private toRecord(row: {
    id: string;
    userId: string;
    propertyId: string;
    sentiment: PrismaSentiment;
    createdAt: Date;
    updatedAt: Date;
  }): FeedbackRecord {
    return {
      id: row.id,
      userId: row.userId,
      propertyId: row.propertyId,
      sentiment: row.sentiment as FeedbackSentiment,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
