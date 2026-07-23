import { Injectable } from '@nestjs/common';
import { Subject } from '../../../domain/subject/subject.entity';
import { SubjectRepository } from '../../../domain/subject/subject.repository';
import { PrismaService } from './prisma.service';
import { SubjectMapper } from './mappers/prisma.mappers';

@Injectable()
export class SubjectPrismaRepository implements SubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(subject: Subject): Promise<Subject> {
    const data = SubjectMapper.toPersistence(subject);
    const row = await this.prisma.subject.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        description: data.description,
        color: data.color,
        updatedAt: data.updatedAt,
      },
    });
    return SubjectMapper.toDomain(row);
  }

  async findById(id: string): Promise<Subject | null> {
    const row = await this.prisma.subject.findUnique({ where: { id } });
    return row ? SubjectMapper.toDomain(row) : null;
  }

  async findByIdForUser(id: string, userId: string): Promise<Subject | null> {
    const row = await this.prisma.subject.findFirst({
      where: { id, userId },
    });
    return row ? SubjectMapper.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Subject[]> {
    const rows = await this.prisma.subject.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return rows.map(SubjectMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subject.delete({ where: { id } });
  }
}
