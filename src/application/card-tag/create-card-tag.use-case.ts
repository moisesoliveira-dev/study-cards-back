import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CARD_TAG_REPOSITORY, COLOR_REPOSITORY } from '../../domain/tokens';
import { CardTag } from '../../domain/card/card-tag.entity';
import type { CardTagRepository } from '../../domain/card/card-tag.repository';
import type { CatalogColorRepository } from '../../domain/color/catalog-color.repository';

@Injectable()
export class CreateCardTagUseCase {
  constructor(
    @Inject(CARD_TAG_REPOSITORY)
    private readonly tags: CardTagRepository,
    @Inject(COLOR_REPOSITORY)
    private readonly colors: CatalogColorRepository,
  ) {}

  async execute(input: {
    name: string;
    colorId: string;
    description?: string | null;
    position?: number;
  }) {
    const color = await this.colors.findById(input.colorId.trim());
    if (!color) {
      throw new NotFoundException('Cor não encontrada');
    }
    const name = input.name.trim();
    const existing = await this.tags.findByName(name);
    if (existing) {
      throw new ConflictException('Já existe uma tag com esse nome.');
    }
    const all = await this.tags.findAll();
    const position =
      input.position ??
      (all.length ? Math.max(...all.map((t) => t.position)) + 1 : 0);
    const tag = CardTag.create({
      name,
      colorId: color.id,
      description: input.description,
      position,
    });
    return this.tags.save(tag);
  }
}
