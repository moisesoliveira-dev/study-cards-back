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
import { ListColorsUseCase } from '../../../application/color/list-colors.use-case';
import { CreateColorUseCase } from '../../../application/color/create-color.use-case';
import { UpdateColorUseCase } from '../../../application/color/update-color.use-case';
import { DeleteColorUseCase } from '../../../application/color/delete-color.use-case';
import { CatalogColor } from '../../../domain/color/catalog-color.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateColorDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(4)
  hex!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

class UpdateColorDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  hex?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

@Controller('colors')
@UseGuards(JwtAuthGuard)
export class ColorController {
  constructor(
    @Inject(ListColorsUseCase)
    private readonly listColors: ListColorsUseCase,
    @Inject(CreateColorUseCase)
    private readonly createColor: CreateColorUseCase,
    @Inject(UpdateColorUseCase)
    private readonly updateColor: UpdateColorUseCase,
    @Inject(DeleteColorUseCase)
    private readonly deleteColor: DeleteColorUseCase,
  ) {}

  @Get()
  async list() {
    const colors = await this.listColors.execute();
    return colors.map((c) => this.toResponse(c));
  }

  @Post()
  async create(@Body() dto: CreateColorDto) {
    return this.toResponse(await this.createColor.execute(dto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateColorDto) {
    return this.toResponse(await this.updateColor.execute(id, dto));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteColor.execute(id);
    return { ok: true };
  }

  private toResponse(color: CatalogColor) {
    return {
      id: color.id,
      name: color.name,
      hex: color.hex,
      description: color.description,
      position: color.position,
      createdAt: color.createdAt,
      updatedAt: color.updatedAt,
    };
  }
}
