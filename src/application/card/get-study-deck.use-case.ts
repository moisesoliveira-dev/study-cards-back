import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class GetStudyDeckUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    query: { topicId?: string; subjectId?: string },
  ): Promise<Card[]> {
    if (query.subjectId && !query.topicId) {
      const subject = await this.subjects.findByIdForUser(
        query.subjectId,
        userId,
      );
      if (!subject) {
        throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
      }
      const cards = await this.cards.findBySubjectId(query.subjectId);
      return cards.sort((a, b) => a.position - b.position);
    }

    if (!query.topicId) {
      throw new DomainError(
        'STUDY_FILTER_REQUIRED',
        'Informe topicId ou subjectId',
      );
    }

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

    const topicIds = await this.topics.findDescendantIds(query.topicId);
    const cards = await this.cards.findByTopicIds(topicIds);
    return cards.sort((a, b) => a.position - b.position);
  }
}
