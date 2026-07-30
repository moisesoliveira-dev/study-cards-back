import { Inject, Injectable } from '@nestjs/common';
import { COLOR_REPOSITORY } from '../../domain/tokens';
import type { CatalogColorRepository } from '../../domain/color/catalog-color.repository';

@Injectable()
export class ListColorsUseCase {
  constructor(
    @Inject(COLOR_REPOSITORY)
    private readonly colors: CatalogColorRepository,
  ) {}

  execute() {
    return this.colors.findAll();
  }
}
