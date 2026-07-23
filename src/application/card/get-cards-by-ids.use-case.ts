import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class GetCardsByIdsUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(userId: string, ids: string[]): Promise<Card[]> {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) return [];

    const found = await this.cards.findByIds(unique);
    const allowed: Card[] = [];

    for (const card of found) {
      const subject = await this.subjects.findByIdForUser(
        card.subjectId,
        userId,
      );
      if (subject) allowed.push(card);
    }

    if (!allowed.length && unique.length) {
      throw new DomainError('CARD_NOT_FOUND', 'Cards not found');
    }

    return allowed;
  }
}
