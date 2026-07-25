import { DomainError } from '../shared/domain.error';

/** Shared password policy for register / reset / change-password. */
export function assertStrongPassword(password: string): void {
  const value = password ?? '';
  if (value.length < 8) {
    throw new DomainError(
      'WEAK_PASSWORD',
      'A senha deve ter pelo menos 8 caracteres',
    );
  }
  if (!/[a-z]/.test(value)) {
    throw new DomainError(
      'WEAK_PASSWORD',
      'A senha precisa de pelo menos uma letra minúscula',
    );
  }
  if (!/[A-Z]/.test(value)) {
    throw new DomainError(
      'WEAK_PASSWORD',
      'A senha precisa de pelo menos uma letra maiúscula',
    );
  }
  if (!/[0-9]/.test(value)) {
    throw new DomainError(
      'WEAK_PASSWORD',
      'A senha precisa de pelo menos um número',
    );
  }
}
