import { DomainError } from '../shared/domain.error';
import { normalizeOptionalCardIcon } from './card-icon';

export type CardStatus = 'NEW' | 'REVIEW' | 'KNOWN';

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeOptionalCardColor(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!HEX_COLOR.test(trimmed)) {
    throw new DomainError(
      'CARD_COLOR_INVALID',
      'Card color must be a hex value like #1D9E75',
    );
  }
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return trimmed.toUpperCase();
}

export interface CardProps {
  id: string;
  subjectId: string;
  topicId: string | null;
  deckId: string | null;
  front: string;
  back: string;
  document: string | null;
  levelId: string | null;
  icon: string | null;
  color: string | null;
  tag: string;
  status: CardStatus;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  linkCount?: number;
  sourceIds?: string[];
}

export class Card {
  private constructor(private props: CardProps) {}

  static create(input: {
    subjectId: string;
    topicId?: string | null;
    deckId?: string | null;
    front: string;
    back: string;
    document?: string | null;
    levelId?: string | null;
    icon?: string | null;
    color?: string | null;
    tag?: string;
    status?: CardStatus;
    position?: number;
  }): Card {
    Card.validateFrontAndBack(input.front, input.back);

    const now = new Date();
    const icon =
      input.icon === undefined
        ? null
        : (normalizeOptionalCardIcon(input.icon) ?? null);
    const color =
      input.color === undefined
        ? null
        : (normalizeOptionalCardColor(input.color) ?? null);

    return new Card({
      id: crypto.randomUUID(),
      subjectId: input.subjectId,
      topicId: input.topicId ?? null,
      deckId: input.deckId ?? null,
      front: input.front.trim(),
      back: input.back.trim(),
      document: input.document?.trim() || null,
      levelId: input.levelId?.trim() || null,
      icon,
      color,
      tag: input.tag?.trim() || 'Conceito',
      status: input.status ?? 'NEW',
      position: input.position ?? 0,
      createdAt: now,
      updatedAt: now,
      linkCount: 0,
      sourceIds: [],
    });
  }

  static reconstitute(props: CardProps): Card {
    return new Card({
      ...props,
      linkCount: props.linkCount ?? 0,
      sourceIds: props.sourceIds ?? [],
    });
  }

  update(input: {
    front?: string;
    back?: string;
    document?: string | null;
    levelId?: string | null;
    icon?: string | null;
    color?: string | null;
    tag?: string;
    status?: CardStatus;
    position?: number;
    topicId?: string | null;
    deckId?: string | null;
  }): void {
    const nextFront = input.front ?? this.props.front;
    const nextBack = input.back ?? this.props.back;
    Card.validateFrontAndBack(nextFront, nextBack);

    if (input.front !== undefined) this.props.front = input.front.trim();
    if (input.back !== undefined) this.props.back = input.back.trim();
    if (input.document !== undefined) {
      this.props.document = input.document?.trim() || null;
    }
    if (input.levelId !== undefined) {
      this.props.levelId = input.levelId?.trim() || null;
    }
    if (input.icon !== undefined) {
      this.props.icon = normalizeOptionalCardIcon(input.icon) ?? null;
    }
    if (input.color !== undefined) {
      this.props.color = normalizeOptionalCardColor(input.color) ?? null;
    }
    if (input.tag !== undefined) this.props.tag = input.tag.trim() || 'Conceito';
    if (input.status !== undefined) this.props.status = input.status;
    if (input.position !== undefined) this.props.position = input.position;
    if (input.topicId !== undefined) this.props.topicId = input.topicId;
    if (input.deckId !== undefined) this.props.deckId = input.deckId;
    this.props.updatedAt = new Date();
  }

  markStatus(status: CardStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  private static validateFrontAndBack(front: string, back: string): void {
    if (!front.trim()) {
      throw new DomainError('CARD_FRONT_EMPTY', 'Card front cannot be empty');
    }
    if (!back.trim()) {
      throw new DomainError('CARD_BACK_EMPTY', 'Card back cannot be empty');
    }
  }

  get id() {
    return this.props.id;
  }
  get subjectId() {
    return this.props.subjectId;
  }
  get topicId() {
    return this.props.topicId;
  }
  get deckId() {
    return this.props.deckId;
  }
  get front() {
    return this.props.front;
  }
  get back() {
    return this.props.back;
  }
  get document() {
    return this.props.document;
  }
  get levelId() {
    return this.props.levelId;
  }
  get icon() {
    return this.props.icon;
  }
  get color() {
    return this.props.color;
  }
  get tag() {
    return this.props.tag;
  }
  get status() {
    return this.props.status;
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
  get linkCount() {
    return this.props.linkCount ?? 0;
  }
  get sourceIds() {
    return this.props.sourceIds ?? [];
  }

  withMeta(meta: { linkCount?: number; sourceIds?: string[] }): Card {
    return Card.reconstitute({
      ...this.props,
      linkCount: meta.linkCount ?? this.props.linkCount,
      sourceIds: meta.sourceIds ?? this.props.sourceIds,
    });
  }
}
