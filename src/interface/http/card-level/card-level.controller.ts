import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ListCardLevelsUseCase } from '../../../application/card-level/list-card-levels.use-case';
import { CreateCardLevelUseCase } from '../../../application/card-level/create-card-level.use-case';
import { UpdateCardLevelUseCase } from '../../../application/card-level/update-card-level.use-case';
import { CardLevel } from '../../../domain/card/card-level.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateCardLevelDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

class UpdateCardLevelDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

@Controller('card-levels')
@UseGuards(JwtAuthGuard)
export class CardLevelController {
  constructor(
    @Inject(ListCardLevelsUseCase)
    private readonly listLevels: ListCardLevelsUseCase,
    @Inject(CreateCardLevelUseCase)
    private readonly createLevel: CreateCardLevelUseCase,
    @Inject(UpdateCardLevelUseCase)
    private readonly updateLevel: UpdateCardLevelUseCase,
  ) {}

  @Get()
  async list() {
    const levels = await this.listLevels.execute();
    return levels.map((level) => this.toResponse(level));
  }

  @Post()
  async create(@Body() dto: CreateCardLevelDto) {
    return this.toResponse(await this.createLevel.execute(dto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCardLevelDto) {
    return this.toResponse(await this.updateLevel.execute(id, dto));
  }

  private toResponse(level: CardLevel) {
    return {
      id: level.id,
      slug: level.slug,
      name: level.name,
      description: level.description,
      color: level.color,
      position: level.position,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
    };
  }
}
