import { DomainError } from '../shared/domain.error';

export interface DocumentNoteProps {
  id: string;
  cardId: string;
  fromPos: number;
  toPos: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentNote {
  private constructor(private props: DocumentNoteProps) {}

  static create(input: {
    cardId: string;
    fromPos: number;
    toPos: number;
    content: string;
  }): DocumentNote {
    DocumentNote.assertRange(input.fromPos, input.toPos);
    const content = input.content.trim();
    if (!content) {
      throw new DomainError(
        'DOCUMENT_NOTE_EMPTY',
        'Note content cannot be empty',
      );
    }
    const now = new Date();
    return new DocumentNote({
      id: crypto.randomUUID(),
      cardId: input.cardId,
      fromPos: input.fromPos,
      toPos: input.toPos,
      content,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: DocumentNoteProps): DocumentNote {
    return new DocumentNote(props);
  }

  update(input: {
    fromPos?: number;
    toPos?: number;
    content?: string;
  }): void {
    const fromPos = input.fromPos ?? this.props.fromPos;
    const toPos = input.toPos ?? this.props.toPos;
    DocumentNote.assertRange(fromPos, toPos);
    this.props.fromPos = fromPos;
    this.props.toPos = toPos;
    if (input.content !== undefined) {
      const content = input.content.trim();
      if (!content) {
        throw new DomainError(
          'DOCUMENT_NOTE_EMPTY',
          'Note content cannot be empty',
        );
      }
      this.props.content = content;
    }
    this.props.updatedAt = new Date();
  }

  private static assertRange(fromPos: number, toPos: number) {
    if (
      !Number.isFinite(fromPos) ||
      !Number.isFinite(toPos) ||
      fromPos < 0 ||
      toPos <= fromPos
    ) {
      throw new DomainError(
        'DOCUMENT_NOTE_INVALID_RANGE',
        'Note range is invalid',
      );
    }
  }

  get id() {
    return this.props.id;
  }
  get cardId() {
    return this.props.cardId;
  }
  get fromPos() {
    return this.props.fromPos;
  }
  get toPos() {
    return this.props.toPos;
  }
  get content() {
    return this.props.content;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
