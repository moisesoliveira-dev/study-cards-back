import { Topic } from '../../domain/topic/topic.entity';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class CreateTopicUseCase {
  constructor(
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(input: {
    subjectId: string;
    parentId?: string | null;
    name: string;
    description?: string | null;
    position?: number;
  }): Promise<Topic> {
    const name = input.name?.trim();
    if (!name) {
      throw new DomainError('TOPIC_NAME_REQUIRED', 'Topic name is required');
    }

    const subject = await this.subjects.findById(input.subjectId);
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }

    if (input.parentId) {
      const parent = await this.topics.findById(input.parentId);
      if (!parent || parent.subjectId !== input.subjectId) {
        throw new DomainError(
          'TOPIC_PARENT_INVALID',
          'Parent topic does not belong to this subject',
        );
      }
    }

    const siblings = await this.topics.findByParentId(
      input.parentId ?? null,
      input.subjectId,
    );
    const position =
      input.position ??
      (siblings.length
        ? Math.max(...siblings.map((s) => s.position)) + 1
        : 0);

    const topic = Topic.create({
      subjectId: input.subjectId,
      parentId: input.parentId ?? null,
      name,
      description: input.description?.trim() || null,
      position,
    });

    return this.topics.save(topic);
  }
}
