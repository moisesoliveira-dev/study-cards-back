import { TopicRepository } from '../../domain/topic/topic.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class DeleteTopicUseCase {
  constructor(private readonly topics: TopicRepository) {}

  async execute(id: string): Promise<void> {
    const topic = await this.topics.findById(id);
    if (!topic) {
      throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
    }
    await this.topics.delete(id);
  }
}
