import { Deck } from './deck.entity';

export interface DeckRepository {
  save(deck: Deck): Promise<Deck>;
  findById(id: string): Promise<Deck | null>;
  findByLocation(
    subjectId: string,
    topicId: string | null,
  ): Promise<Deck[]>;
  delete(id: string): Promise<void>;
}
