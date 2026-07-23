export interface SubjectProps {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Subject {
  private constructor(private props: SubjectProps) {}

  static create(input: {
    userId: string;
    name: string;
    description?: string | null;
    color?: string;
  }): Subject {
    const now = new Date();

    return new Subject({
      id: crypto.randomUUID(),
      userId: input.userId,
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? '#1b4332',
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: SubjectProps): Subject {
    return new Subject({ ...props });
  }

  update(input: {
    name?: string;
    description?: string | null;
    color?: string;
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
    this.props.updatedAt = new Date();
  }

  belongsTo(userId: string): boolean {
    return this.props.userId === userId;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
