import { DomainError } from '../shared/domain.error';

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeCatalogHex(value: string): string {
  const trimmed = value.trim();
  if (!HEX.test(trimmed)) {
    throw new DomainError(
      'COLOR_HEX_INVALID',
      'Cor deve ser um hex como #1D9E75',
    );
  }
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return trimmed.toUpperCase();
}

export interface CatalogColorProps {
  id: string;
  name: string;
  hex: string;
  description: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CatalogColor {
  private constructor(private props: CatalogColorProps) {}

  static create(input: {
    name: string;
    hex: string;
    description?: string | null;
    position?: number;
  }): CatalogColor {
    const name = input.name.trim();
    if (!name) {
      throw new DomainError('COLOR_NAME_EMPTY', 'Nome da cor é obrigatório');
    }
    const hex = normalizeCatalogHex(input.hex);
    const now = new Date();
    return new CatalogColor({
      id: crypto.randomUUID(),
      name,
      hex,
      description: input.description?.trim() || null,
      position: input.position ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CatalogColorProps): CatalogColor {
    return new CatalogColor(props);
  }

  update(input: {
    name?: string;
    hex?: string;
    description?: string | null;
    position?: number;
  }): void {
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new DomainError('COLOR_NAME_EMPTY', 'Nome da cor é obrigatório');
      }
      this.props.name = name;
    }
    if (input.hex !== undefined) {
      this.props.hex = normalizeCatalogHex(input.hex);
    }
    if (input.description !== undefined) {
      this.props.description = input.description?.trim() || null;
    }
    if (input.position !== undefined) this.props.position = input.position;
    this.props.updatedAt = new Date();
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get hex() {
    return this.props.hex;
  }
  get description() {
    return this.props.description;
  }
  get position() {
    return this.props.position;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
