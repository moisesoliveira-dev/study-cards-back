import { DomainError } from '../shared/domain.error';

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function assertValidUsername(raw: string): string {
  const username = normalizeUsername(raw);
  if (!USERNAME_RE.test(username)) {
    throw new DomainError(
      'INVALID_USERNAME',
      'O usuário deve ter 3–24 caracteres (letras, números ou _)',
    );
  }
  return username;
}
