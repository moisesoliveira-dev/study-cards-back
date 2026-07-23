import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class DeleteTopicUseCase {
  constructor(
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const topic = await this.topics.findById(id);
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

    await this.topics.delete(id);
  }
}
