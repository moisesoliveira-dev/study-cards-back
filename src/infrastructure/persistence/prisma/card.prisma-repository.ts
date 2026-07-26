import { Injectable } from '@nestjs/common';
import { Card } from '../../../domain/card/card.entity';
import { CardRepository } from '../../../domain/card/card.repository';
import { PrismaService } from './prisma.service';
import { CardMapper } from './mappers/prisma.mappers';

@Injectable()
export class CardPrismaRepository implements CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async withMeta(row: Parameters<typeof CardMapper.toDomain>[0]) {
    const [linkCount, sources] = await Promise.all([
      this.prisma.cardLink.count({ where: { targetCardId: row.id } }),
      this.prisma.cardLink.findMany({
        where: { targetCardId: row.id },
        select: { sourceCardId: true },
      }),
    ]);
    return CardMapper.toDomain(row, {
      linkCount,
      sourceIds: sources.map((s) => s.sourceCardId),
    });
  }

  async save(card: Card): Promise<Card> {
    const data = CardMapper.toPersistence(card);
    const row = await this.prisma.card.upsert({
      where: { id: data.id },
      create: data,
      update: {
        subjectId: data.subjectId,
        topicId: data.topicId,
        front: data.front,
        back: data.back,
        document: data.document,
        levelId: data.levelId,
        icon: data.icon,
        color: data.color,
        tag: data.tag,
        status: data.status,
        position: data.position,
        updatedAt: data.updatedAt,
      },
    });
    return this.withMeta(row);
  }

  async findById(id: string): Promise<Card | null> {
    const row = await this.prisma.card.findUnique({ where: { id } });
    return row ? this.withMeta(row) : null;
  }

  async findByIds(ids: string[]): Promise<Card[]> {
    if (!ids.length) return [];
    const rows = await this.prisma.card.findMany({
      where: { id: { in: ids } },
    });
    return Promise.all(rows.map((row) => this.withMeta(row)));
  }

  async findByTopicId(topicId: string): Promise<Card[]> {
    const rows = await this.prisma.card.findMany({
      where: { topicId },
      orderBy: { position: 'asc' },
    });
    return Promise.all(rows.map((row) => this.withMeta(row)));
  }

  async findByTopicIds(ids: string[]): Promise<Card[]> {
    if (!ids.length) return [];
    const rows = await this.prisma.card.findMany({
      where: { topicId: { in: ids } },
      orderBy: { position: 'asc' },
    });
    return Promise.all(rows.map((row) => this.withMeta(row)));
  }

  async findRootBySubjectId(subjectId: string): Promise<Card[]> {
    const rows = await this.prisma.card.findMany({
      where: { subjectId, topicId: null },
      orderBy: { position: 'asc' },
    });
    return Promise.all(rows.map((row) => this.withMeta(row)));
  }

  async findBySubjectId(subjectId: string): Promise<Card[]> {
    const rows = await this.prisma.card.findMany({
      where: { subjectId },
      orderBy: { position: 'asc' },
    });
    return Promise.all(rows.map((row) => this.withMeta(row)));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.card.delete({ where: { id } });
  }

  async linkSources(targetCardId: string, sourceCardIds: string[]): Promise<void> {
    await this.prisma.cardLink.createMany({
      data: sourceCardIds.map((sourceCardId) => ({
        id: crypto.randomUUID(),
        sourceCardId,
        targetCardId,
      })),
      skipDuplicates: true,
    });
  }

  async countLinks(cardId: string): Promise<number> {
    return this.prisma.cardLink.count({ where: { targetCardId: cardId } });
  }

  async findSourceIds(cardId: string): Promise<string[]> {
    const rows = await this.prisma.cardLink.findMany({
      where: { targetCardId: cardId },
      select: { sourceCardId: true },
    });
    return rows.map((r) => r.sourceCardId);
  }
}
