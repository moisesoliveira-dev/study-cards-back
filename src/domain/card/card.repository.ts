import { Card } from './card.entity';

export interface CardRepository {
  save(card: Card): Promise<Card>;
  findById(id: string): Promise<Card | null>;
  findByIds(ids: string[]): Promise<Card[]>;
  findByTopicId(topicId: string): Promise<Card[]>;
  findByTopicIds(ids: string[]): Promise<Card[]>;
  delete(id: string): Promise<void>;
  linkSources(targetCardId: string, sourceCardIds: string[]): Promise<void>;
  countLinks(cardId: string): Promise<number>;
  findSourceIds(cardId: string): Promise<string[]>;
}
