import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class ListCardsByTopicUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(userId: string, topicId: string): Promise<Card[]> {
    const topic = await this.topics.findById(topicId);
    if (!topic) {
      throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
    }
    const subject = await this.subjects.findByIdForUser(
      topic.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
    }

    const cards = await this.cards.findByTopicId(topicId);
    return cards.sort((a, b) => a.position - b.position);
  }
}
