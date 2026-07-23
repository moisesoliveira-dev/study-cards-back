import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';
import {
  AuthResult,
  AuthTokenPayload,
  TokenSigner,
} from './register-user.use-case';

export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: {
    email: string;
    password: string;
  }): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase();
    if (!email || !input.password) {
      throw new DomainError(
        'INVALID_CREDENTIALS',
        'E-mail ou senha inválidos',
      );
    }

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new DomainError(
        'INVALID_CREDENTIALS',
        'E-mail ou senha inválidos',
      );
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new DomainError(
        'INVALID_CREDENTIALS',
        'E-mail ou senha inválidos',
      );
    }

    const payload: AuthTokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.tokenSigner.sign(payload);

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
