import { DomainError } from '../shared/domain.error';

const ICON_KEY_RE = /^[a-z0-9_]{1,40}$/;

/**
 * Accepts any stable icon key (frontend owns the catalog).
 * Empty / null clears the icon.
 */
export function normalizeCardIcon(
  raw: string | null | undefined,
): string | null {
  if (raw === undefined) {
    throw new DomainError('INVALID_ICON', 'Ícone inválido');
  }
  if (raw === null) return null;
  const icon = raw.trim().toLowerCase();
  if (!icon) return null;
  if (!ICON_KEY_RE.test(icon)) {
    throw new DomainError('INVALID_ICON', 'Ícone inválido');
  }
  return icon;
}

/** For optional updates: undefined = leave unchanged. */
export function normalizeOptionalCardIcon(
  raw: string | null | undefined,
): string | null | undefined {
  if (raw === undefined) return undefined;
  return normalizeCardIcon(raw);
}
