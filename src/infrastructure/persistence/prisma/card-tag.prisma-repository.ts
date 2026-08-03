import { Injectable } from '@nestjs/common';
import { CardTag } from '../../../domain/card/card-tag.entity';
import { CardTagRepository } from '../../../domain/card/card-tag.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class CardTagPrismaRepository implements CardTagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CardTag[]> {
    const rows = await this.prisma.cardTag.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => CardTag.reconstitute(row));
  }

  async findById(id: string): Promise<CardTag | null> {
    const row = await this.prisma.cardTag.findUnique({ where: { id } });
    return row ? CardTag.reconstitute(row) : null;
  }

  async findByName(name: string): Promise<CardTag | null> {
    const row = await this.prisma.cardTag.findUnique({ where: { name } });
    return row ? CardTag.reconstitute(row) : null;
  }

  async save(tag: CardTag): Promise<CardTag> {
    const row = await this.prisma.cardTag.upsert({
      where: { id: tag.id },
      create: {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        colorId: tag.colorId,
        position: tag.position,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      },
      update: {
        name: tag.name,
        description: tag.description,
        colorId: tag.colorId,
        position: tag.position,
        updatedAt: tag.updatedAt,
      },
    });
    return CardTag.reconstitute(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cardTag.delete({ where: { id } });
  }
}
