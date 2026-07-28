import { DocumentNote } from './document-note.entity';

export interface DocumentNoteRepository {
  findById(id: string): Promise<DocumentNote | null>;
  findByCardId(cardId: string): Promise<DocumentNote[]>;
  save(note: DocumentNote): Promise<DocumentNote>;
  delete(id: string): Promise<void>;
}
