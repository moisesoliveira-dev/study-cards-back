import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class GetCardUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(userId: string, id: string): Promise<Card> {
    const card = await this.cards.findById(id);
    if (!card) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }
    const subject = await this.subjects.findByIdForUser(card.subjectId, userId);
    if (!subject) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }
    return card;
  }
}
