import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CARD_TAG_REPOSITORY, COLOR_REPOSITORY } from '../../domain/tokens';
import type { CardTagRepository } from '../../domain/card/card-tag.repository';
import type { CatalogColorRepository } from '../../domain/color/catalog-color.repository';

@Injectable()
export class UpdateCardTagUseCase {
  constructor(
    @Inject(CARD_TAG_REPOSITORY)
    private readonly tags: CardTagRepository,
    @Inject(COLOR_REPOSITORY)
    private readonly colors: CatalogColorRepository,
  ) {}

  async execute(
    id: string,
    input: {
      name?: string;
      colorId?: string;
      description?: string | null;
      position?: number;
    },
  ) {
    const tag = await this.tags.findById(id);
    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }
    if (input.colorId !== undefined) {
      const color = await this.colors.findById(input.colorId.trim());
      if (!color) {
        throw new NotFoundException('Cor não encontrada');
      }
    }
    if (input.name !== undefined) {
      const name = input.name.trim();
      const existing = await this.tags.findByName(name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe uma tag com esse nome.');
      }
    }
    tag.update(input);
    return this.tags.save(tag);
  }
}
