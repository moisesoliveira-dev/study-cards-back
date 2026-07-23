import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class GetStudyDeckUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
  ) {}

  async execute(topicId: string): Promise<Card[]> {
    const topic = await this.topics.findById(topicId);
    if (!topic) {
      throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
    }

    const topicIds = await this.topics.findDescendantIds(topicId);
    const cards = await this.cards.findByTopicIds(topicIds);
    return cards.sort((a, b) => a.position - b.position);
  }
}
