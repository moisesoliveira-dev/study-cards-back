import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCardUseCase } from '../../../application/card/create-card.use-case';
import { ListCardsByTopicUseCase } from '../../../application/card/list-cards-by-topic.use-case';
import { GetStudyDeckUseCase } from '../../../application/card/get-study-deck.use-case';
import { UpdateCardUseCase } from '../../../application/card/update-card.use-case';
import { DeleteCardUseCase } from '../../../application/card/delete-card.use-case';
import { MergeCardsUseCase } from '../../../application/card/merge-cards.use-case';
import { CreateCardDto, MergeCardsDto, UpdateCardDto } from './card.dto';
import { Card } from '../../../domain/card/card.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(
    @Inject(CreateCardUseCase)
    private readonly createCard: CreateCardUseCase,
    @Inject(ListCardsByTopicUseCase)
    private readonly listCards: ListCardsByTopicUseCase,
    @Inject(GetStudyDeckUseCase)
    private readonly studyDeck: GetStudyDeckUseCase,
    @Inject(UpdateCardUseCase)
    private readonly updateCard: UpdateCardUseCase,
    @Inject(DeleteCardUseCase)
    private readonly deleteCard: DeleteCardUseCase,
    @Inject(MergeCardsUseCase)
    private readonly mergeCards: MergeCardsUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query('topicId') topicId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    const cards = await this.listCards.execute(user.id, { topicId, subjectId });
    return cards.map((c) => this.toResponse(c));
  }

  @Get('study')
  async study(
    @CurrentUser() user: AuthUser,
    @Query('topicId') topicId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    const cards = await this.studyDeck.execute(user.id, { topicId, subjectId });
    return cards.map((c) => this.toResponse(c));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateCardDto) {
    return this.toResponse(await this.createCard.execute(user.id, dto));
  }

  @Post('merge')
  async merge(@CurrentUser() user: AuthUser, @Body() dto: MergeCardsDto) {
    return this.toResponse(await this.mergeCards.execute(user.id, dto));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.toResponse(await this.updateCard.execute(user.id, id, dto));
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.deleteCard.execute(user.id, id);
    return { ok: true };
  }

  private toResponse(card: Card) {
    return {
      id: card.id,
      subjectId: card.subjectId,
      topicId: card.topicId,
      front: card.front,
      back: card.back,
      hint: card.hint,
      tag: card.tag,
      status: card.status,
      position: card.position,
      linkCount: card.linkCount,
      sourceIds: card.sourceIds,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }
}
