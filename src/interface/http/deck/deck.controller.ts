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
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  CreateDeckUseCase,
  DeleteDeckUseCase,
  ListDecksUseCase,
  UpdateDeckUseCase,
} from '../../../application/deck/deck.use-cases';
import { Deck } from '../../../domain/deck/deck.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

class CreateDeckDto {
  @IsUUID()
  subjectId!: string;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID()
  topicId?: string | null;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  color?: string;
}

class UpdateDeckDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DeckController {
  constructor(
    @Inject(CreateDeckUseCase)
    private readonly createDeck: CreateDeckUseCase,
    @Inject(ListDecksUseCase)
    private readonly listDecks: ListDecksUseCase,
    @Inject(UpdateDeckUseCase)
    private readonly updateDeck: UpdateDeckUseCase,
    @Inject(DeleteDeckUseCase)
    private readonly deleteDeck: DeleteDeckUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query('subjectId') subjectId: string,
    @Query('topicId') topicId?: string,
  ) {
    const decks = await this.listDecks.execute(user.id, {
      subjectId,
      topicId: topicId === undefined || topicId === '' ? null : topicId,
    });
    return decks.map((d) => this.toResponse(d));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateDeckDto) {
    return this.toResponse(await this.createDeck.execute(user.id, dto));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateDeckDto,
  ) {
    return this.toResponse(await this.updateDeck.execute(user.id, id, dto));
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.deleteDeck.execute(user.id, id);
    return { ok: true };
  }

  private toResponse(deck: Deck) {
    return {
      id: deck.id,
      subjectId: deck.subjectId,
      topicId: deck.topicId,
      name: deck.name,
      description: deck.description,
      color: deck.color,
      position: deck.position,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }
}
