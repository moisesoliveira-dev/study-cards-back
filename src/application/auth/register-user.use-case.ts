import * as bcrypt from 'bcrypt';
import { User } from '../../domain/user/user.entity';
import { UserRepository } from '../../domain/user/user.repository';
import { assertValidUsername } from '../../domain/user/username';
import { assertStrongPassword } from '../../domain/user/password-policy';
import { DomainError } from '../../domain/shared/domain.error';
import {
  AuthResult,
  AuthTokenPayload,
  TokenSigner,
  toAuthUserView,
} from './auth-types';

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: {
    email: string;
    username: string;
    password: string;
    name?: string | null;
  }): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new DomainError('INVALID_EMAIL', 'Informe um e-mail válido');
    }

    const username = assertValidUsername(input.username ?? '');
    assertStrongPassword(input.password ?? '');

    const existingEmail = await this.users.findByEmail(email);
    if (existingEmail) {
      throw new DomainError('EMAIL_IN_USE', 'Este e-mail já está cadastrado');
    }

    const existingUsername = await this.users.findByUsername(username);
    if (existingUsername) {
      throw new DomainError(
        'USERNAME_IN_USE',
        'Este nome de usuário já está em uso',
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = User.create({
      email,
      username,
      passwordHash,
      name: input.name,
    });
    const saved = await this.users.save(user);

    const payload: AuthTokenPayload = { sub: saved.id, email: saved.email };
    const accessToken = await this.tokenSigner.sign(payload);

    return {
      accessToken,
      user: toAuthUserView(saved),
    };
  }
}
