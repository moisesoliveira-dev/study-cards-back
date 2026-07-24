export interface UserProps {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(input: {
    email: string;
    username: string;
    passwordHash: string;
    name?: string | null;
  }): User {
    const now = new Date();
    return new User({
      id: crypto.randomUUID(),
      email: input.email.toLowerCase().trim(),
      username: input.username.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      name: input.name?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User({ ...props });
  }

  updateProfile(input: {
    name?: string | null;
    email?: string;
    username?: string;
  }): void {
    if (input.name !== undefined) {
      this.props.name = input.name?.trim() || null;
    }
    if (input.email !== undefined) {
      this.props.email = input.email.toLowerCase().trim();
    }
    if (input.username !== undefined) {
      this.props.username = input.username.toLowerCase().trim();
    }
    this.props.updatedAt = new Date();
  }

  changePasswordHash(passwordHash: string): void {
    this.props.passwordHash = passwordHash;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get username(): string {
    return this.props.username;
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
