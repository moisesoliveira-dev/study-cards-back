export interface DeckProps {
  id: string;
  subjectId: string;
  topicId: string | null;
  name: string;
  description: string | null;
  color: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Deck {
  private constructor(private props: DeckProps) {}

  static create(input: {
    subjectId: string;
    topicId?: string | null;
    name: string;
    description?: string | null;
    color?: string;
    position?: number;
  }): Deck {
    const now = new Date();
    return new Deck({
      id: crypto.randomUUID(),
      subjectId: input.subjectId,
      topicId: input.topicId ?? null,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      color: input.color?.trim() || '#7F77DD',
      position: input.position ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: DeckProps): Deck {
    return new Deck({ ...props });
  }

  update(input: {
    name?: string;
    description?: string | null;
    color?: string;
    position?: number;
  }): void {
    if (input.name !== undefined) this.props.name = input.name.trim();
    if (input.description !== undefined) {
      this.props.description = input.description?.trim() || null;
    }
    if (input.color !== undefined) {
      this.props.color = input.color.trim() || '#7F77DD';
    }
    if (input.position !== undefined) this.props.position = input.position;
    this.props.updatedAt = new Date();
  }

  get id() {
    return this.props.id;
  }
  get subjectId() {
    return this.props.subjectId;
  }
  get topicId() {
    return this.props.topicId;
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
