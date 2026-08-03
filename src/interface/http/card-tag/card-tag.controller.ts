import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ListCardTagsUseCase } from '../../../application/card-tag/list-card-tags.use-case';
import { CreateCardTagUseCase } from '../../../application/card-tag/create-card-tag.use-case';
import { UpdateCardTagUseCase } from '../../../application/card-tag/update-card-tag.use-case';
import { DeleteCardTagUseCase } from '../../../application/card-tag/delete-card-tag.use-case';
import { CardTag } from '../../../domain/card/card-tag.entity';
import { COLOR_REPOSITORY } from '../../../domain/tokens';
import type { CatalogColorRepository } from '../../../domain/color/catalog-color.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateCardTagDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  colorId!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

class UpdateCardTagDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  colorId?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

@Controller('card-tags')
@UseGuards(JwtAuthGuard)
export class CardTagController {
  constructor(
    @Inject(ListCardTagsUseCase)
    private readonly listTags: ListCardTagsUseCase,
    @Inject(CreateCardTagUseCase)
    private readonly createTag: CreateCardTagUseCase,
    @Inject(UpdateCardTagUseCase)
    private readonly updateTag: UpdateCardTagUseCase,
    @Inject(DeleteCardTagUseCase)
    private readonly deleteTag: DeleteCardTagUseCase,
    @Inject(COLOR_REPOSITORY)
    private readonly colors: CatalogColorRepository,
  ) {}

  @Get()
  async list() {
    const tags = await this.listTags.execute();
    return Promise.all(tags.map((t) => this.toResponse(t)));
  }

  @Post()
  async create(@Body() dto: CreateCardTagDto) {
    return this.toResponse(await this.createTag.execute(dto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCardTagDto) {
    return this.toResponse(await this.updateTag.execute(id, dto));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteTag.execute(id);
    return { ok: true };
  }

  private async toResponse(tag: CardTag) {
    const color = await this.colors.findById(tag.colorId);
    return {
      id: tag.id,
      name: tag.name,
      description: tag.description,
      colorId: tag.colorId,
      color: color
        ? { id: color.id, name: color.name, hex: color.hex }
        : null,
      position: tag.position,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}
