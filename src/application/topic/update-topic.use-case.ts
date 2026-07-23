import { Topic } from '../../domain/topic/topic.entity';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class UpdateTopicUseCase {
  constructor(private readonly topics: TopicRepository) {}

  async execute(
    id: string,
    input: {
      name?: string;
      description?: string | null;
      position?: number;
    },
  ): Promise<Topic> {
    const topic = await this.topics.findById(id);
    if (!topic) {
      throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new DomainError('TOPIC_NAME_REQUIRED', 'Topic name is required');
    }

    topic.update({
      name: input.name?.trim(),
      description:
        input.description === undefined
          ? undefined
          : input.description?.trim() || null,
      position: input.position,
    });

    return this.topics.save(topic);
  }
}
