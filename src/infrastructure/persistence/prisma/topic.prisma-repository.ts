import { Injectable } from '@nestjs/common';
import { Topic } from '../../../domain/topic/topic.entity';
import { TopicRepository } from '../../../domain/topic/topic.repository';
import { PrismaService } from './prisma.service';
import { TopicMapper } from './mappers/prisma.mappers';

@Injectable()
export class TopicPrismaRepository implements TopicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(topic: Topic): Promise<Topic> {
    const data = TopicMapper.toPersistence(topic);
    const row = await this.prisma.topic.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        position: data.position,
        updatedAt: data.updatedAt,
      },
    });
    return TopicMapper.toDomain(row);
  }

  async findById(id: string): Promise<Topic | null> {
    const row = await this.prisma.topic.findUnique({ where: { id } });
    return row ? TopicMapper.toDomain(row) : null;
  }

  async findBySubjectId(subjectId: string): Promise<Topic[]> {
    const rows = await this.prisma.topic.findMany({
      where: { subjectId },
      orderBy: { position: 'asc' },
    });
    return rows.map(TopicMapper.toDomain);
  }

  async findByParentId(
    parentId: string | null,
    subjectId: string,
  ): Promise<Topic[]> {
    const rows = await this.prisma.topic.findMany({
      where: { subjectId, parentId },
      orderBy: { position: 'asc' },
    });
    return rows.map(TopicMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.topic.delete({ where: { id } });
  }

  async findDescendantIds(topicId: string): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE topic_tree AS (
        SELECT id FROM "Topic" WHERE id = ${topicId}
        UNION ALL
        SELECT t.id FROM "Topic" t
        INNER JOIN topic_tree tt ON t."parentId" = tt.id
      )
      SELECT id FROM topic_tree
    `;
    return rows.map((r) => r.id);
  }
}
