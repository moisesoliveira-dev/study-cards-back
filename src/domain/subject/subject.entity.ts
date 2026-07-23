export interface SubjectProps {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Subject {
  private constructor(private props: SubjectProps) {}

  static create(input: {
    name: string;
    description?: string | null;
    color?: string;
  }): Subject {
    const now = new Date();

    return new Subject({
      id: crypto.randomUUID(),
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

  get id(): string {
    return this.props.id;
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
