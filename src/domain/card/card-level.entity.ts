import { DomainError } from '../shared/domain.error';

export interface CardLevelProps {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CardLevel {
  private constructor(private props: CardLevelProps) {}

  static create(input: {
    slug: string;
    name: string;
    description?: string | null;
    color?: string | null;
    position?: number;
  }): CardLevel {
    const slug = CardLevel.normalizeSlug(input.slug);
    const name = input.name.trim();
    if (!slug) {
      throw new DomainError('CARD_LEVEL_SLUG_EMPTY', 'Level slug cannot be empty');
    }
    if (!name) {
      throw new DomainError('CARD_LEVEL_NAME_EMPTY', 'Level name cannot be empty');
    }
    const now = new Date();
    return new CardLevel({
      id: crypto.randomUUID(),
      slug,
      name,
      description: input.description?.trim() || null,
      color: input.color?.trim() || null,
      position: input.position ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CardLevelProps): CardLevel {
    return new CardLevel(props);
  }

  update(input: {
    name?: string;
    description?: string | null;
    color?: string | null;
    position?: number;
  }): void {
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new DomainError(
          'CARD_LEVEL_NAME_EMPTY',
          'Level name cannot be empty',
        );
      }
      this.props.name = name;
    }
    if (input.description !== undefined) {
      this.props.description = input.description?.trim() || null;
    }
    if (input.color !== undefined) {
      this.props.color = input.color?.trim() || null;
    }
    if (input.position !== undefined) this.props.position = input.position;
    this.props.updatedAt = new Date();
  }

  static normalizeSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  get id() {
    return this.props.id;
  }
  get slug() {
    return this.props.slug;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get color() {
    return this.props.color;
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
