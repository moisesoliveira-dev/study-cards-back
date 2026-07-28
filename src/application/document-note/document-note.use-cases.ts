import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CARD_REPOSITORY,
  DOCUMENT_NOTE_REPOSITORY,
  SUBJECT_REPOSITORY,
} from '../../domain/tokens';
import type { CardRepository } from '../../domain/card/card.repository';
import type { SubjectRepository } from '../../domain/subject/subject.repository';
import { DocumentNote } from '../../domain/document-note/document-note.entity';
import type { DocumentNoteRepository } from '../../domain/document-note/document-note.repository';

@Injectable()
export class AssertCardOwnershipService {
  constructor(
    @Inject(CARD_REPOSITORY) private readonly cards: CardRepository,
    @Inject(SUBJECT_REPOSITORY) private readonly subjects: SubjectRepository,
  ) {}

  async assert(userId: string, cardId: string) {
    const card = await this.cards.findById(cardId);
    if (!card) throw new NotFoundException('Card not found');
    const subject = await this.subjects.findByIdForUser(card.subjectId, userId);
    if (!subject) throw new NotFoundException('Card not found');
    return card;
  }
}

@Injectable()
export class ListDocumentNotesUseCase {
  constructor(
    @Inject(DOCUMENT_NOTE_REPOSITORY)
    private readonly notes: DocumentNoteRepository,
    private readonly ownership: AssertCardOwnershipService,
  ) {}

  async execute(userId: string, cardId: string) {
    await this.ownership.assert(userId, cardId);
    return this.notes.findByCardId(cardId);
  }
}

@Injectable()
export class CreateDocumentNoteUseCase {
  constructor(
    @Inject(DOCUMENT_NOTE_REPOSITORY)
    private readonly notes: DocumentNoteRepository,
    private readonly ownership: AssertCardOwnershipService,
  ) {}

  async execute(
    userId: string,
    cardId: string,
    input: { fromPos: number; toPos: number; content: string },
  ) {
    await this.ownership.assert(userId, cardId);
    const note = DocumentNote.create({ cardId, ...input });
    return this.notes.save(note);
  }
}

@Injectable()
export class UpdateDocumentNoteUseCase {
  constructor(
    @Inject(DOCUMENT_NOTE_REPOSITORY)
    private readonly notes: DocumentNoteRepository,
    private readonly ownership: AssertCardOwnershipService,
  ) {}

  async execute(
    userId: string,
    cardId: string,
    noteId: string,
    input: { fromPos?: number; toPos?: number; content?: string },
  ) {
    await this.ownership.assert(userId, cardId);
    const note = await this.notes.findById(noteId);
    if (!note || note.cardId !== cardId) {
      throw new NotFoundException('Note not found');
    }
    note.update(input);
    return this.notes.save(note);
  }
}

@Injectable()
export class DeleteDocumentNoteUseCase {
  constructor(
    @Inject(DOCUMENT_NOTE_REPOSITORY)
    private readonly notes: DocumentNoteRepository,
    private readonly ownership: AssertCardOwnershipService,
  ) {}

  async execute(userId: string, cardId: string, noteId: string) {
    await this.ownership.assert(userId, cardId);
    const note = await this.notes.findById(noteId);
    if (!note || note.cardId !== cardId) {
      throw new NotFoundException('Note not found');
    }
    await this.notes.delete(noteId);
  }
}
