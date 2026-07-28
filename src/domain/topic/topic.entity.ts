export interface TopicProps {
  id: string;
  subjectId: string;
  parentId: string | null;
  name: string;
  description: string | null;
  color: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Topic {
  private constructor(private props: TopicProps) {}

  static create(input: {
    subjectId: string;
    parentId?: string | null;
    name: string;
    description?: string | null;
    color?: string;
    position?: number;
  }): Topic {
    const now = new Date();

    return new Topic({
      id: crypto.randomUUID(),
      subjectId: input.subjectId,
      parentId: input.parentId ?? null,
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? '#BA7517',
      position: input.position ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: TopicProps): Topic {
    return new Topic({ ...props });
  }

  update(input: {
    name?: string;
    description?: string | null;
    color?: string;
    position?: number;
    parentId?: string | null;
  }): void {
    if (input.name !== undefined) {
      this.props.name = input.name;
    }
    if (input.description !== undefined) {
      this.props.description = input.description;
    }
    if (input.color !== undefined) {
      this.props.color = input.color;
    }
    if (input.position !== undefined) {
      this.props.position = input.position;
    }
    if (input.parentId !== undefined) {
      this.props.parentId = input.parentId;
    }
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get subjectId(): string {
    return this.props.subjectId;
  }

  get parentId(): string | null {
    return this.props.parentId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get color(): string {
    return this.props.color;
  }

  get position(): number {
    return this.props.position;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
