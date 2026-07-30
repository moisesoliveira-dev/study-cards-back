import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { COLOR_REPOSITORY } from '../../domain/tokens';
import type { CatalogColorRepository } from '../../domain/color/catalog-color.repository';

@Injectable()
export class DeleteColorUseCase {
  constructor(
    @Inject(COLOR_REPOSITORY)
    private readonly colors: CatalogColorRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const color = await this.colors.findById(id);
    if (!color) throw new NotFoundException('Cor não encontrada.');
    await this.colors.delete(id);
  }
}
