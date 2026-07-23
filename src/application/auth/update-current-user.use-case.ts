import { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class UpdateCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(
    userId: string,
    input: { name?: string | null; email?: string },
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

    user.updateProfile({
      name: input.name,
      email: nextEmail,
    });

    const saved = await this.users.save(user);
    return {
      id: saved.id,
      email: saved.email,
      name: saved.name,
    };
  }
}
