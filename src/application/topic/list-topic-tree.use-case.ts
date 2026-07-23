import { Topic } from '../../domain/topic/topic.entity';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export type TopicTreeNode = {
  id: string;
  subjectId: string;
  parentId: string | null;
  name: string;
  description: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  children: TopicTreeNode[];
};

export class ListTopicTreeUseCase {
  constructor(
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(userId: string, subjectId: string): Promise<TopicTreeNode[]> {
    const subject = await this.subjects.findByIdForUser(subjectId, userId);
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }

    const topics = await this.topics.findBySubjectId(subjectId);
    return this.buildTree(topics);
  }

  private buildTree(topics: Topic[]): TopicTreeNode[] {
    const byParent = new Map<string | null, Topic[]>();

    for (const topic of topics) {
      const key = topic.parentId;
      const list = byParent.get(key) ?? [];
      list.push(topic);
      byParent.set(key, list);
    }

    for (const list of byParent.values()) {
      list.sort((a, b) => a.position - b.position);
    }

    const toNode = (topic: Topic): TopicTreeNode => ({
      id: topic.id,
      subjectId: topic.subjectId,
      parentId: topic.parentId,
      name: topic.name,
      description: topic.description,
      position: topic.position,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      children: (byParent.get(topic.id) ?? []).map(toNode),
    });

    return (byParent.get(null) ?? []).map(toNode);
  }
}
