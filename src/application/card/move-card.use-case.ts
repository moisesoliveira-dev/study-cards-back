import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class MoveCardUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    input: { topicId?: string | null },
  ): Promise<Card> {
    const card = await this.cards.findById(id);
    if (!card) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }

    const subject = await this.subjects.findByIdForUser(
      card.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }

    const topicId =
      input.topicId === undefined ? card.topicId : input.topicId;

    if (topicId) {
      const topic = await this.topics.findById(topicId);
      if (!topic || topic.subjectId !== card.subjectId) {
        throw new DomainError(
          'TOPIC_NOT_FOUND',
          'Pasta de destino inválida',
        );
      }
    }

    if (topicId === card.topicId) {
      return card;
    }

    const siblings = topicId
      ? await this.cards.findByTopicId(topicId)
      : await this.cards.findRootBySubjectId(card.subjectId);
    const position = siblings.length
      ? Math.max(...siblings.map((c) => c.position)) + 1
      : 0;

    card.update({ topicId, position });
    return this.cards.save(card);
  }
}
