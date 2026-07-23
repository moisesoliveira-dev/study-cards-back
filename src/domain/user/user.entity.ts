export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(input: {
    email: string;
    passwordHash: string;
    name?: string | null;
  }): User {
    const now = new Date();
    return new User({
      id: crypto.randomUUID(),
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      name: input.name?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get name(): string | null {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
