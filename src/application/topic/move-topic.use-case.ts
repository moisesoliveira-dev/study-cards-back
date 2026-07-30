import { Topic } from '../../domain/topic/topic.entity';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class MoveTopicUseCase {
  constructor(
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    input: {
      beforeTopicId?: string | null;
      position?: number;
    },
  ): Promise<Topic> {
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

    const siblings = (
      await this.topics.findByParentId(topic.parentId, topic.subjectId)
    ).filter((t) => t.id !== topic.id);

    let position = input.position;
    if (position === undefined && input.beforeTopicId) {
      const before = siblings.find((t) => t.id === input.beforeTopicId);
      position = before ? before.position : undefined;
    }
    if (position === undefined) {
      position = siblings.length
        ? Math.max(...siblings.map((t) => t.position)) + 1
        : 0;
    }

    if (input.beforeTopicId) {
      const ordered = [...siblings].sort((a, b) => a.position - b.position);
      let next = position;
      for (const sibling of ordered) {
        if (sibling.position >= position) {
          next += 1;
          sibling.update({ position: next });
          await this.topics.save(sibling);
        }
      }
    }

    topic.update({ position });
    return this.topics.save(topic);
  }
}
