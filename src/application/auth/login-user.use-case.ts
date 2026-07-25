import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';
import { normalizeUsername } from '../../domain/user/username';
import {
  AuthResult,
  AuthTokenPayload,
  TokenSigner,
  toAuthUserView,
} from './auth-types';

const DEFAULT_EXPIRES = 60 * 60 * 24; // 1 day
const REMEMBER_EXPIRES = 60 * 60 * 24 * 30; // 30 days

export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly tokenSigner: TokenSigner,
    private readonly rememberExpiresSeconds = REMEMBER_EXPIRES,
    private readonly defaultExpiresSeconds = DEFAULT_EXPIRES,
  ) {}

  async execute(input: {
    login: string;
    password: string;
    rememberMe?: boolean;
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
    const expiresInSeconds = input.rememberMe
      ? this.rememberExpiresSeconds
      : this.defaultExpiresSeconds;
    const accessToken = await this.tokenSigner.sign(payload, {
      expiresInSeconds,
    });

    return {
      accessToken,
      user: toAuthUserView(user),
    };
  }
}
