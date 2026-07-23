import { Topic } from './topic.entity';

export interface TopicRepository {
  save(topic: Topic): Promise<Topic>;
  findById(id: string): Promise<Topic | null>;
  findBySubjectId(subjectId: string): Promise<Topic[]>;
  findByParentId(
    parentId: string | null,
    subjectId: string,
  ): Promise<Topic[]>;
  delete(id: string): Promise<void>;
  findDescendantIds(topicId: string): Promise<string[]>;
}
