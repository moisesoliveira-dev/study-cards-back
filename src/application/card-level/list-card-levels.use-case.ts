import { Inject, Injectable } from '@nestjs/common';
import { CARD_LEVEL_REPOSITORY } from '../../domain/tokens';
import { CardLevelRepository } from '../../domain/card/card-level.repository';

@Injectable()
export class ListCardLevelsUseCase {
  constructor(
    @Inject(CARD_LEVEL_REPOSITORY)
    private readonly levels: CardLevelRepository,
  ) {}

  execute() {
    return this.levels.findAll();
  }
}
