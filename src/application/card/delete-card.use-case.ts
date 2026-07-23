import { CardRepository } from '../../domain/card/card.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class DeleteCardUseCase {
  constructor(private readonly cards: CardRepository) {}

  async execute(id: string): Promise<void> {
    const card = await this.cards.findById(id);
    if (!card) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }
    await this.cards.delete(id);
  }
}
