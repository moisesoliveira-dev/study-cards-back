import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CARD_LEVEL_REPOSITORY } from '../../domain/tokens';
import type { CardLevelRepository } from '../../domain/card/card-level.repository';

@Injectable()
export class UpdateCardLevelUseCase {
  constructor(
    @Inject(CARD_LEVEL_REPOSITORY)
    private readonly levels: CardLevelRepository,
  ) {}

  async execute(
    id: string,
    input: {
      name?: string;
      description?: string | null;
      color?: string | null;
      position?: number;
    },
  ) {
    const level = await this.levels.findById(id);
    if (!level) throw new NotFoundException('Nível não encontrado.');
    level.update(input);
    return this.levels.save(level);
  }
}
