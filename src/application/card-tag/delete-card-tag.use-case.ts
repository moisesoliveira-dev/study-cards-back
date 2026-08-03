import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CARD_TAG_REPOSITORY } from '../../domain/tokens';
import type { CardTagRepository } from '../../domain/card/card-tag.repository';

@Injectable()
export class DeleteCardTagUseCase {
  constructor(
    @Inject(CARD_TAG_REPOSITORY)
    private readonly tags: CardTagRepository,
  ) {}

  async execute(id: string) {
    const tag = await this.tags.findById(id);
    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }
    await this.tags.delete(id);
  }
}
