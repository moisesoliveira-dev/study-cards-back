import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { COLOR_REPOSITORY } from '../../domain/tokens';
import { normalizeCatalogHex } from '../../domain/color/catalog-color.entity';
import type { CatalogColorRepository } from '../../domain/color/catalog-color.repository';

@Injectable()
export class UpdateColorUseCase {
  constructor(
    @Inject(COLOR_REPOSITORY)
    private readonly colors: CatalogColorRepository,
  ) {}

  async execute(
    id: string,
    input: {
      name?: string;
      hex?: string;
      description?: string | null;
      position?: number;
    },
  ) {
    const color = await this.colors.findById(id);
    if (!color) throw new NotFoundException('Cor não encontrada.');

    if (input.hex !== undefined) {
      const hex = normalizeCatalogHex(input.hex);
      const clash = await this.colors.findByHex(hex);
      if (clash && clash.id !== id) {
        throw new ConflictException('Já existe uma cor com esse hex.');
      }
    }

    color.update(input);
    return this.colors.save(color);
  }
}
