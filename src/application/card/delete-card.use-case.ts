import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class DeleteCardUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const card = await this.cards.findById(id);
    if (!card) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }

    const topic = await this.topics.findById(card.topicId);
    if (!topic) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }
    const subject = await this.subjects.findByIdForUser(
      topic.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }

    await this.cards.delete(id);
  }
}
