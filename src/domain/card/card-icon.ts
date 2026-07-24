import { DomainError } from '../shared/domain.error';

const ICON_KEY_RE = /^[a-z0-9_]{1,40}$/;
const CUSTOM_IMAGE_RE =
  /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=\s]+$/i;
/** ~90KB raw string — keeps JSON payloads under Nest's default body limit. */
const MAX_CUSTOM_ICON_CHARS = 90_000;

/**
 * Catalog key, custom data-URL image, or emoji:… payload.
 * Empty / null clears the icon.
 */
export function normalizeCardIcon(
  raw: string | null | undefined,
): string | null {
  if (raw === undefined) {
    throw new DomainError('INVALID_ICON', 'Ícone inválido');
  }
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:image/')) {
    if (trimmed.length > MAX_CUSTOM_ICON_CHARS) {
      throw new DomainError(
        'ICON_TOO_LARGE',
        'Ícone personalizado muito grande (máx. ~64KB)',
      );
    }
    const compact = trimmed.replace(/\s+/g, '');
    if (!CUSTOM_IMAGE_RE.test(compact)) {
      throw new DomainError(
        'INVALID_ICON',
        'Use PNG, JPG, WEBP, GIF ou SVG',
      );
    }
    return compact;
  }

  if (trimmed.startsWith('emoji:')) {
    const emoji = trimmed.slice(6).trim();
    if (!emoji || [...emoji].length > 8) {
      throw new DomainError('INVALID_ICON', 'Emoji inválido');
    }
    return `emoji:${emoji}`;
  }

  const icon = trimmed.toLowerCase();
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
