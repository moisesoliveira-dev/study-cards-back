import * as bcrypt from 'bcrypt';
import { User } from '../../domain/user/user.entity';
import { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

export type AuthResult = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

export type TokenSigner = {
  sign(payload: AuthTokenPayload): Promise<string>;
};

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: {
    email: string;
    password: string;
    name?: string | null;
  }): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new DomainError('INVALID_EMAIL', 'Informe um e-mail válido');
    }

    const password = input.password ?? '';
    if (password.length < 6) {
      throw new DomainError(
        'WEAK_PASSWORD',
        'A senha deve ter pelo menos 6 caracteres',
      );
    }

    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new DomainError('EMAIL_IN_USE', 'Este e-mail já está cadastrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.create({
      email,
      passwordHash,
      name: input.name,
    });
    const saved = await this.users.save(user);

    return this.toAuthResult(saved);
  }

  private async toAuthResult(user: User): Promise<AuthResult> {
    const accessToken = await this.tokenSigner.sign({
      sub: user.id,
      email: user.email,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
