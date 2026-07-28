import { Topic } from '../../domain/topic/topic.entity';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class UpdateTopicUseCase {
  constructor(
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    input: {
      name?: string;
      description?: string | null;
      color?: string;
      position?: number;
      parentId?: string | null;
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

    if (input.name !== undefined && !input.name.trim()) {
      throw new DomainError('TOPIC_NAME_REQUIRED', 'Topic name is required');
    }

    let parentId = topic.parentId;
    if (input.parentId !== undefined) {
      parentId = input.parentId;
      if (parentId === id) {
        throw new DomainError(
          'TOPIC_PARENT_INVALID',
          'Uma pasta não pode ser filha de si mesma',
        );
      }
      if (parentId) {
        const parent = await this.topics.findById(parentId);
        if (!parent || parent.subjectId !== topic.subjectId) {
          throw new DomainError(
            'TOPIC_PARENT_INVALID',
            'Pasta pai inválida',
          );
        }
        const descendants = await this.topics.findDescendantIds(id);
        if (descendants.includes(parentId)) {
          throw new DomainError(
            'TOPIC_PARENT_CYCLE',
            'Não dá para mover uma pasta para dentro dela mesma',
          );
        }
      }
    }

    let position = input.position;
    if (input.parentId !== undefined && input.parentId !== topic.parentId) {
      const siblings = await this.topics.findByParentId(
        parentId,
        topic.subjectId,
      );
      position =
        siblings.length
          ? Math.max(...siblings.map((s) => s.position)) + 1
          : 0;
    }

    topic.update({
      name: input.name?.trim(),
      description:
        input.description === undefined
          ? undefined
          : input.description?.trim() || null,
      color: input.color?.trim(),
      position,
      parentId: input.parentId !== undefined ? parentId : undefined,
    });

    return this.topics.save(topic);
  }
}
