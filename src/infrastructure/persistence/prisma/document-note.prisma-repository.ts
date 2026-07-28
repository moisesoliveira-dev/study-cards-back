import { Injectable } from '@nestjs/common';
import { DocumentNote } from '../../../domain/document-note/document-note.entity';
import type { DocumentNoteRepository } from '../../../domain/document-note/document-note.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class DocumentNotePrismaRepository implements DocumentNoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DocumentNote | null> {
    const row = await this.prisma.documentNote.findUnique({ where: { id } });
    return row ? DocumentNote.reconstitute(row) : null;
  }

  async findByCardId(cardId: string): Promise<DocumentNote[]> {
    const rows = await this.prisma.documentNote.findMany({
      where: { cardId },
      orderBy: [{ fromPos: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => DocumentNote.reconstitute(row));
  }

  async save(note: DocumentNote): Promise<DocumentNote> {
    const row = await this.prisma.documentNote.upsert({
      where: { id: note.id },
      create: {
        id: note.id,
        cardId: note.cardId,
        fromPos: note.fromPos,
        toPos: note.toPos,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
      update: {
        fromPos: note.fromPos,
        toPos: note.toPos,
        content: note.content,
        updatedAt: note.updatedAt,
      },
    });
    return DocumentNote.reconstitute(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.documentNote.delete({ where: { id } });
  }
}
