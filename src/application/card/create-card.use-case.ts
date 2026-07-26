import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class CreateCardUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    input: {
      subjectId?: string;
      topicId?: string | null;
      front: string;
      back: string;
      document?: string | null;
      levelId?: string | null;
      icon?: string | null;
      color?: string | null;
      tag?: string;
      position?: number;
    },
  ): Promise<Card> {
    let subjectId = input.subjectId?.trim() || '';
    const topicId = input.topicId?.trim() || null;

    if (topicId) {
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
      subjectId = topic.subjectId;
    } else {
      if (!subjectId) {
        throw new DomainError(
          'SUBJECT_REQUIRED',
          'Informe o grupo (subjectId) para criar o card na raiz',
        );
      }
      const subject = await this.subjects.findByIdForUser(subjectId, userId);
      if (!subject) {
        throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
      }
    }

    const siblings = topicId
      ? await this.cards.findByTopicId(topicId)
      : await this.cards.findRootBySubjectId(subjectId);
    const position =
      input.position ??
      (siblings.length
        ? Math.max(...siblings.map((c) => c.position)) + 1
        : 0);

    const card = Card.create({
      subjectId,
      topicId,
      front: input.front,
      back: input.back,
      document: input.document,
      levelId: input.levelId?.trim() || null,
      icon: input.icon,
      color: input.color,
      tag: input.tag,
      position,
    });

    return this.cards.save(card);
  }
}
