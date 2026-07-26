import { Injectable } from '@nestjs/common';
import { CardLevel } from '../../../domain/card/card-level.entity';
import { CardLevelRepository } from '../../../domain/card/card-level.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class CardLevelPrismaRepository implements CardLevelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CardLevel[]> {
    const rows = await this.prisma.cardLevel.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => CardLevel.reconstitute(row));
  }

  async findById(id: string): Promise<CardLevel | null> {
    const row = await this.prisma.cardLevel.findUnique({ where: { id } });
    return row ? CardLevel.reconstitute(row) : null;
  }

  async findBySlug(slug: string): Promise<CardLevel | null> {
    const row = await this.prisma.cardLevel.findUnique({ where: { slug } });
    return row ? CardLevel.reconstitute(row) : null;
  }

  async save(level: CardLevel): Promise<CardLevel> {
    const row = await this.prisma.cardLevel.upsert({
      where: { id: level.id },
      create: {
        id: level.id,
        slug: level.slug,
        name: level.name,
        description: level.description,
        color: level.color,
        position: level.position,
        createdAt: level.createdAt,
        updatedAt: level.updatedAt,
      },
      update: {
        name: level.name,
        description: level.description,
        color: level.color,
        position: level.position,
        updatedAt: level.updatedAt,
      },
    });
    return CardLevel.reconstitute(row);
  }
}
