import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { UserRepository } from '../../domain/user/user.repository';
import { assertStrongPassword } from '../../domain/user/password-policy';
import { DomainError } from '../../domain/shared/domain.error';
import { hashSecret } from './auth-secrets';

export class ResetPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: {
    token: string;
    password: string;
  }): Promise<{ ok: true }> {
    const token = (input.token ?? '').trim();
    if (!token) {
      throw new DomainError('INVALID_TOKEN', 'Link de redefinição inválido');
    }

    assertStrongPassword(input.password ?? '');

    const row = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashSecret(token) },
    });

    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
      throw new DomainError(
        'INVALID_TOKEN',
        'Este link expirou ou já foi usado. Solicite um novo.',
      );
    }

    const user = await this.users.findById(row.userId);
    if (!user) {
      throw new DomainError('USER_NOT_FOUND', 'Usuário não encontrado');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    user.changePasswordHash(passwordHash);
    await this.users.save(user);

    await this.prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });

    return { ok: true };
  }
}
