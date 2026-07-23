import { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class GetCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new DomainError('USER_NOT_FOUND', 'Usuário não encontrado');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
