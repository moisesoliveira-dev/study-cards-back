import { User } from '../../domain/user/user.entity';
import { UserRepository } from '../../domain/user/user.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { DomainError } from '../../domain/shared/domain.error';
import { hashSecret } from './auth-secrets';
import {
  AuthResult,
  AuthTokenPayload,
  TokenSigner,
  toAuthUserView,
} from './auth-types';

export class ConfirmRegistrationUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly prisma: PrismaService,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: {
    email: string;
    code: string;
  }): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase();
    const code = (input.code ?? '').trim();
    if (!email || !code) {
      throw new DomainError(
        'INVALID_CODE',
        'Informe o e-mail e o código de verificação',
      );
    }

    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (!pending) {
      throw new DomainError(
        'PENDING_NOT_FOUND',
        'Não há cadastro pendente para este e-mail',
      );
    }

    if (pending.expiresAt.getTime() < Date.now()) {
      throw new DomainError(
        'CODE_EXPIRED',
        'O código expirou. Solicite um novo.',
      );
    }

    if (pending.codeHash !== hashSecret(code)) {
      throw new DomainError('INVALID_CODE', 'Código de verificação inválido');
    }

    const existingEmail = await this.users.findByEmail(email);
    if (existingEmail) {
      await this.prisma.pendingRegistration.delete({ where: { email } });
      throw new DomainError('EMAIL_IN_USE', 'Este e-mail já está cadastrado');
    }

    const existingUsername = await this.users.findByUsername(pending.username);
    if (existingUsername) {
      throw new DomainError(
        'USERNAME_IN_USE',
        'Este nome de usuário já está em uso',
      );
    }

    const user = User.create({
      email: pending.email,
      username: pending.username,
      passwordHash: pending.passwordHash,
      name: pending.name,
    });
    const saved = await this.users.save(user);
    await this.prisma.pendingRegistration.delete({ where: { email } });

    const payload: AuthTokenPayload = { sub: saved.id, email: saved.email };
    const accessToken = await this.tokenSigner.sign(payload);

    return {
      accessToken,
      user: toAuthUserView(saved),
    };
  }
}
