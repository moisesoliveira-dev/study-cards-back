import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';
import { assertStrongPassword } from '../../domain/user/password-policy';

export class ChangePasswordUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(
    userId: string,
    input: { currentPassword: string; newPassword: string },
  ): Promise<{ ok: true }> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new DomainError('USER_NOT_FOUND', 'Usuário não encontrado');
    }

    const currentPassword = input.currentPassword ?? '';
    const newPassword = input.newPassword ?? '';

    if (!currentPassword) {
      throw new DomainError(
        'CURRENT_PASSWORD_REQUIRED',
        'Informe a senha atual',
      );
    }

    assertStrongPassword(newPassword);

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new DomainError(
        'INVALID_CREDENTIALS',
        'Senha atual incorreta',
      );
    }

    if (currentPassword === newPassword) {
      throw new DomainError(
        'SAME_PASSWORD',
        'A nova senha deve ser diferente da atual',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.changePasswordHash(passwordHash);
    await this.users.save(user);

    return { ok: true };
  }
}
