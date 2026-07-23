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

  async execute(
    userId: string,
    query: { topicId?: string; subjectId?: string; all?: boolean },
  ): Promise<Card[]> {
    if (query.topicId) {
      const topic = await this.topics.findById(query.topicId);
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
      const cards = await this.cards.findByTopicId(query.topicId);
      return cards.sort((a, b) => a.position - b.position);
    }

    if (query.subjectId) {
      const subject = await this.subjects.findByIdForUser(
        query.subjectId,
        userId,
      );
      if (!subject) {
        throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
      }
      const cards = query.all
        ? await this.cards.findBySubjectId(query.subjectId)
        : await this.cards.findRootBySubjectId(query.subjectId);
      return cards.sort((a, b) => a.position - b.position);
    }

    throw new DomainError(
      'LIST_FILTER_REQUIRED',
      'Informe topicId ou subjectId',
    );
  }
}
