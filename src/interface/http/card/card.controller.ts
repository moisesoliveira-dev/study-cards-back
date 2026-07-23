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
import { GetCardUseCase } from '../../../application/card/get-card.use-case';
import { GetCardsByIdsUseCase } from '../../../application/card/get-cards-by-ids.use-case';
import { UpdateCardUseCase } from '../../../application/card/update-card.use-case';
import { DeleteCardUseCase } from '../../../application/card/delete-card.use-case';
import { MergeCardsUseCase } from '../../../application/card/merge-cards.use-case';
import { CreateCardDto, MergeCardsDto, MoveCardDto, UpdateCardDto } from './card.dto';
import { Card } from '../../../domain/card/card.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MoveCardUseCase } from '../../../application/card/move-card.use-case';

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
    @Inject(GetCardUseCase)
    private readonly getCard: GetCardUseCase,
    @Inject(GetCardsByIdsUseCase)
    private readonly getCardsByIds: GetCardsByIdsUseCase,
    @Inject(UpdateCardUseCase)
    private readonly updateCard: UpdateCardUseCase,
    @Inject(DeleteCardUseCase)
    private readonly deleteCard: DeleteCardUseCase,
    @Inject(MergeCardsUseCase)
    private readonly mergeCards: MergeCardsUseCase,
    @Inject(MoveCardUseCase)
    private readonly moveCard: MoveCardUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query('topicId') topicId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('ids') ids?: string,
    @Query('all') all?: string,
  ) {
    if (ids?.trim()) {
      const list = await this.getCardsByIds.execute(
        user.id,
        ids.split(',').map((id) => id.trim()),
      );
      return list.map((c) => this.toResponse(c));
    }
    const cards = await this.listCards.execute(user.id, {
      topicId,
      subjectId,
      all: all === '1' || all === 'true',
    });
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

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.toResponse(await this.getCard.execute(user.id, id));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateCardDto) {
    return this.toResponse(await this.createCard.execute(user.id, dto));
  }

  @Post('merge')
  async merge(@CurrentUser() user: AuthUser, @Body() dto: MergeCardsDto) {
    return this.toResponse(await this.mergeCards.execute(user.id, dto));
  }

  @Post(':id/move')
  async move(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: MoveCardDto,
  ) {
    return this.toResponse(await this.moveCard.execute(user.id, id, dto));
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
      document: card.document,
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
