import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CARD_LEVEL_REPOSITORY } from '../../domain/tokens';
import { CardLevel } from '../../domain/card/card-level.entity';
import type { CardLevelRepository } from '../../domain/card/card-level.repository';

@Injectable()
export class CreateCardLevelUseCase {
  constructor(
    @Inject(CARD_LEVEL_REPOSITORY)
    private readonly levels: CardLevelRepository,
  ) {}

  async execute(input: {
    name: string;
    slug?: string;
    description?: string | null;
    color?: string | null;
    position?: number;
  }) {
    const slug = CardLevel.normalizeSlug(input.slug || input.name);
    const existing = await this.levels.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Já existe um nível com esse identificador.');
    }
    const all = await this.levels.findAll();
    const position =
      input.position ??
      (all.length ? Math.max(...all.map((l) => l.position)) + 1 : 0);
    const level = CardLevel.create({
      slug,
      name: input.name,
      description: input.description,
      color: input.color,
      position,
    });
    return this.levels.save(level);
  }
}
