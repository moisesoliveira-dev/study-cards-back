import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

async function assertTopicOwnedBy(
  topics: TopicRepository,
  subjects: SubjectRepository,
  topicId: string,
  userId: string,
) {
  const topic = await topics.findById(topicId);
  if (!topic) {
    throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
  }
  const subject = await subjects.findByIdForUser(topic.subjectId, userId);
  if (!subject) {
    throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
  }
  return topic;
}

export class CreateCardUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    input: {
      topicId: string;
      front: string;
      back: string;
      hint?: string | null;
      tag?: string;
      position?: number;
    },
  ): Promise<Card> {
    await assertTopicOwnedBy(
      this.topics,
      this.subjects,
      input.topicId,
      userId,
    );

    const existing = await this.cards.findByTopicId(input.topicId);
    const position =
      input.position ??
      (existing.length
        ? Math.max(...existing.map((c) => c.position)) + 1
        : 0);

    const card = Card.create({
      topicId: input.topicId,
      front: input.front,
      back: input.back,
      hint: input.hint?.trim() || null,
      tag: input.tag,
      position,
    });

    return this.cards.save(card);
  }
}
