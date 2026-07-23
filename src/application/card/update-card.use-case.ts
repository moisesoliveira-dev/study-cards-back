import { Card, CardStatus } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class UpdateCardUseCase {
  constructor(private readonly cards: CardRepository) {}

  async execute(
    id: string,
    input: {
      front?: string;
      back?: string;
      hint?: string | null;
      tag?: string;
      status?: CardStatus;
      position?: number;
    },
  ): Promise<Card> {
    const card = await this.cards.findById(id);
    if (!card) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }

    card.update({
      front: input.front,
      back: input.back,
      hint:
        input.hint === undefined ? undefined : input.hint?.trim() || null,
      tag: input.tag,
      status: input.status,
      position: input.position,
    });

    return this.cards.save(card);
  }
}
