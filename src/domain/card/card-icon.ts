import { DomainError } from '../shared/domain.error';

/** Curated icon keys shared with the frontend picker. */
export const CARD_ICON_KEYS = [
  'bulb',
  'code',
  'server',
  'cloud',
  'database',
  'network',
  'shield',
  'flash',
  'book',
  'brain',
  'layers',
  'globe',
  'key',
  'rocket',
  'terminal',
  'hardware',
  'link',
  'puzzle',
  'map',
  'flag',
] as const;

export type CardIconKey = (typeof CARD_ICON_KEYS)[number];

const ALLOWED = new Set<string>(CARD_ICON_KEYS);

export function normalizeCardIcon(
  raw: string | null | undefined,
): string | null {
  if (raw === undefined) {
    throw new DomainError('INVALID_ICON', 'Ícone inválido');
  }
  if (raw === null) return null;
  const icon = raw.trim().toLowerCase();
  if (!icon) return null;
  if (!ALLOWED.has(icon)) {
    throw new DomainError('INVALID_ICON', 'Ícone não suportado');
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
