import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CARD_LEVEL_REPOSITORY } from '../../domain/tokens';
import type { CardLevelRepository } from '../../domain/card/card-level.repository';

@Injectable()
export class DeleteCardLevelUseCase {
  constructor(
    @Inject(CARD_LEVEL_REPOSITORY)
    private readonly levels: CardLevelRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const level = await this.levels.findById(id);
    if (!level) throw new NotFoundException('Nível não encontrado.');
    await this.levels.delete(id);
  }
}
