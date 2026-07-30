import { Injectable } from '@nestjs/common';
import { Deck } from '../../../domain/deck/deck.entity';
import { DeckRepository } from '../../../domain/deck/deck.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class DeckPrismaRepository implements DeckRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(deck: Deck): Promise<Deck> {
    const row = await this.prisma.deck.upsert({
      where: { id: deck.id },
      create: {
        id: deck.id,
        subjectId: deck.subjectId,
        topicId: deck.topicId,
        name: deck.name,
        description: deck.description,
        color: deck.color,
        position: deck.position,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
      },
      update: {
        name: deck.name,
        description: deck.description,
        color: deck.color,
        position: deck.position,
        updatedAt: deck.updatedAt,
      },
    });
    return Deck.reconstitute(row);
  }

  async findById(id: string): Promise<Deck | null> {
    const row = await this.prisma.deck.findUnique({ where: { id } });
    return row ? Deck.reconstitute(row) : null;
  }

  async findByLocation(
    subjectId: string,
    topicId: string | null,
  ): Promise<Deck[]> {
    const rows = await this.prisma.deck.findMany({
      where: { subjectId, topicId },
      orderBy: { position: 'asc' },
    });
    return rows.map((row) => Deck.reconstitute(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deck.delete({ where: { id } });
  }
}
