import { Inject, Injectable } from '@nestjs/common';
import { CARD_TAG_REPOSITORY } from '../../domain/tokens';
import type { CardTagRepository } from '../../domain/card/card-tag.repository';

@Injectable()
export class ListCardTagsUseCase {
  constructor(
    @Inject(CARD_TAG_REPOSITORY)
    private readonly tags: CardTagRepository,
  ) {}

  execute() {
    return this.tags.findAll();
  }
}
