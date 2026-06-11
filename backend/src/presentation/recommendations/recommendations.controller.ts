import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetRecommendationsUseCase } from '../../application/recommendation/get-recommendations.use-case';
import { RecordFeedbackUseCase } from '../../application/recommendation/record-feedback.use-case';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';
import { RecommendationCandidate } from '../../domain/recommendation/entities/recommendation-candidate';
import { FeedbackSentiment } from '../../domain/recommendation/value-objects/feedback-sentiment.vo';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { GetRecommendationsQueryDto } from './dto/get-recommendations-query.dto';
import { RecordFeedbackDto } from './dto/record-feedback.dto';

function toItemDto(candidate: RecommendationCandidate) {
  return {
    propertyId: candidate.propertyId,
    score: candidate.score,
    reasonStub: candidate.reasonStub,
    listing: candidate.listing,
  };
}

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly getRecommendations: GetRecommendationsUseCase,
    private readonly recordFeedback: RecordFeedbackUseCase,
  ) {}

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @UseGuards(OptionalJwtAuthGuard)
  async list(
    @Query() query: GetRecommendationsQueryDto,
    @CurrentUser() user?: AccessTokenPayload,
  ) {
    const page = await (user
      ? this.getRecommendations.executeForUser(
          user.sub,
          query.page,
          query.pageSize,
          query.refresh,
        )
      : this.getRecommendations.executeForGuest(query.page, query.pageSize));

    return {
      title: page.title,
      mode: page.mode,
      items: page.items.map(toItemDto),
      pagination: page.pagination,
      ...(page.cta ? { cta: page.cta } : {}),
    };
  }

  @Post('feedback')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
  @Roles(UserRole.Buyer, UserRole.Agent)
  async feedback(
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: RecordFeedbackDto,
  ) {
    const sentiment =
      body.sentiment === 'like'
        ? FeedbackSentiment.Like
        : FeedbackSentiment.Dislike;

    const result = await this.recordFeedback.execute(
      user.sub,
      body.propertyId,
      sentiment,
    );

    return {
      feedbackId: result.feedbackId,
      propertyId: result.propertyId,
      sentiment: result.sentiment,
      recorded: result.recorded,
      created: result.created,
    };
  }
}
