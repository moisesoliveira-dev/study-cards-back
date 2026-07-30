import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { COLOR_REPOSITORY } from '../../domain/tokens';
import {
  CatalogColor,
  normalizeCatalogHex,
} from '../../domain/color/catalog-color.entity';
import type { CatalogColorRepository } from '../../domain/color/catalog-color.repository';

@Injectable()
export class CreateColorUseCase {
  constructor(
    @Inject(COLOR_REPOSITORY)
    private readonly colors: CatalogColorRepository,
  ) {}

  async execute(input: {
    name: string;
    hex: string;
    description?: string | null;
    position?: number;
  }) {
    const hex = normalizeCatalogHex(input.hex);
    const existing = await this.colors.findByHex(hex);
    if (existing) {
      throw new ConflictException('Já existe uma cor com esse hex.');
    }
    const all = await this.colors.findAll();
    const position =
      input.position ??
      (all.length ? Math.max(...all.map((c) => c.position)) + 1 : 0);
    const color = CatalogColor.create({
      name: input.name,
      hex,
      description: input.description,
      position,
    });
    return this.colors.save(color);
  }
}
