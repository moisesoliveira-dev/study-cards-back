import { CatalogColor } from './catalog-color.entity';

export interface CatalogColorRepository {
  findAll(): Promise<CatalogColor[]>;
  findById(id: string): Promise<CatalogColor | null>;
  findByHex(hex: string): Promise<CatalogColor | null>;
  save(color: CatalogColor): Promise<CatalogColor>;
  delete(id: string): Promise<void>;
}
