import { CardTag } from './card-tag.entity';

export interface CardTagRepository {
  findAll(): Promise<CardTag[]>;
  findById(id: string): Promise<CardTag | null>;
  findByName(name: string): Promise<CardTag | null>;
  save(tag: CardTag): Promise<CardTag>;
  delete(id: string): Promise<void>;
}
