import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';
import { normalizeUsername } from '../../domain/user/username';
import {
  AuthResult,
  AuthTokenPayload,
  TokenSigner,
  toAuthUserView,
} from './register-user.use-case';

export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: {
    login: string;
    password: string;
  }): Promise<AuthResult> {
    const login = input.login?.trim().toLowerCase();
    if (!login || !input.password) {
      throw new DomainError(
        'INVALID_CREDENTIALS',
        'Usuário/e-mail ou senha inválidos',
      );
    }

    const user = login.includes('@')
      ? await this.users.findByEmail(login)
      : await this.users.findByUsername(normalizeUsername(login));

    if (!user) {
      throw new DomainError(
        'INVALID_CREDENTIALS',
        'Usuário/e-mail ou senha inválidos',
      );
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new DomainError(
        'INVALID_CREDENTIALS',
        'Usuário/e-mail ou senha inválidos',
      );
    }

    const payload: AuthTokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.tokenSigner.sign(payload);

    return {
      accessToken,
      user: toAuthUserView(user),
    };
  }
}
