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
} from '@nestjs/common';
import { CreateCardUseCase } from '../../../application/card/create-card.use-case';
import { ListCardsByTopicUseCase } from '../../../application/card/list-cards-by-topic.use-case';
import { GetStudyDeckUseCase } from '../../../application/card/get-study-deck.use-case';
import { UpdateCardUseCase } from '../../../application/card/update-card.use-case';
import { DeleteCardUseCase } from '../../../application/card/delete-card.use-case';
import { MergeCardsUseCase } from '../../../application/card/merge-cards.use-case';
import { CreateCardDto, MergeCardsDto, UpdateCardDto } from './card.dto';
import { Card } from '../../../domain/card/card.entity';

@Controller('cards')
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
  async list(@Query('topicId') topicId: string) {
    const cards = await this.listCards.execute(topicId);
    return cards.map((c) => this.toResponse(c));
  }

  @Get('study')
  async study(@Query('topicId') topicId: string) {
    const cards = await this.studyDeck.execute(topicId);
    return cards.map((c) => this.toResponse(c));
  }

  @Post()
  async create(@Body() dto: CreateCardDto) {
    return this.toResponse(await this.createCard.execute(dto));
  }

  @Post('merge')
  async merge(@Body() dto: MergeCardsDto) {
    return this.toResponse(await this.mergeCards.execute(dto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.toResponse(await this.updateCard.execute(id, dto));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteCard.execute(id);
    return { ok: true };
  }

  private toResponse(card: Card) {
    return {
      id: card.id,
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
