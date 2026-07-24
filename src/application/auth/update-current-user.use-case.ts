import { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';
import { assertValidUsername } from '../../domain/user/username';
import { toAuthUserView } from './register-user.use-case';

export class UpdateCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(
    userId: string,
    input: { name?: string | null; email?: string; username?: string },
  ) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new DomainError('USER_NOT_FOUND', 'Usuário não encontrado');
    }

    let nextEmail: string | undefined;
    if (input.email !== undefined) {
      nextEmail = input.email.trim().toLowerCase();
      if (!nextEmail || !nextEmail.includes('@')) {
        throw new DomainError('INVALID_EMAIL', 'Informe um e-mail válido');
      }
      if (nextEmail !== user.email) {
        const taken = await this.users.findByEmail(nextEmail);
        if (taken && taken.id !== user.id) {
          throw new DomainError('EMAIL_IN_USE', 'Este e-mail já está cadastrado');
        }
      }
    }

    let nextUsername: string | undefined;
    if (input.username !== undefined) {
      nextUsername = assertValidUsername(input.username);
      if (nextUsername !== user.username) {
        const taken = await this.users.findByUsername(nextUsername);
        if (taken && taken.id !== user.id) {
          throw new DomainError(
            'USERNAME_IN_USE',
            'Este nome de usuário já está em uso',
          );
        }
      }
    }

    user.updateProfile({
      name: input.name,
      email: nextEmail,
      username: nextUsername,
    });

    const saved = await this.users.save(user);
    return toAuthUserView(saved);
  }
}
