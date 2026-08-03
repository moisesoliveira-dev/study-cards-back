import { DomainError } from '../shared/domain.error';

export interface CardTagProps {
  id: string;
  name: string;
  description: string | null;
  colorId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CardTag {
  private constructor(private props: CardTagProps) {}

  static create(input: {
    name: string;
    colorId: string;
    description?: string | null;
    position?: number;
  }): CardTag {
    const name = input.name.trim();
    if (!name) {
      throw new DomainError('CARD_TAG_NAME_EMPTY', 'Nome da tag é obrigatório');
    }
    const colorId = input.colorId.trim();
    if (!colorId) {
      throw new DomainError('CARD_TAG_COLOR_REQUIRED', 'Selecione uma cor');
    }
    const now = new Date();
    return new CardTag({
      id: crypto.randomUUID(),
      name,
      description: input.description?.trim() || null,
      colorId,
      position: input.position ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CardTagProps): CardTag {
    return new CardTag(props);
  }

  update(input: {
    name?: string;
    description?: string | null;
    colorId?: string;
    position?: number;
  }): void {
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new DomainError('CARD_TAG_NAME_EMPTY', 'Nome da tag é obrigatório');
      }
      this.props.name = name;
    }
    if (input.description !== undefined) {
      this.props.description = input.description?.trim() || null;
    }
    if (input.colorId !== undefined) {
      const colorId = input.colorId.trim();
      if (!colorId) {
        throw new DomainError('CARD_TAG_COLOR_REQUIRED', 'Selecione uma cor');
      }
      this.props.colorId = colorId;
    }
    if (input.position !== undefined) this.props.position = input.position;
    this.props.updatedAt = new Date();
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get colorId() {
    return this.props.colorId;
  }
  get position() {
    return this.props.position;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
