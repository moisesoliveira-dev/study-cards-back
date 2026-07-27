import { CardLevel } from './card-level.entity';

export interface CardLevelRepository {
  findAll(): Promise<CardLevel[]>;
  findById(id: string): Promise<CardLevel | null>;
  findBySlug(slug: string): Promise<CardLevel | null>;
  save(level: CardLevel): Promise<CardLevel>;
  delete(id: string): Promise<void>;
}
