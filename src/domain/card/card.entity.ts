import { DomainError } from '../shared/domain.error';

export type CardStatus = 'NEW' | 'REVIEW' | 'KNOWN';

export interface CardProps {
  id: string;
  subjectId: string;
  topicId: string | null;
  front: string;
  back: string;
  hint: string | null;
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
    front: string;
    back: string;
    hint?: string | null;
    tag?: string;
    status?: CardStatus;
    position?: number;
  }): Card {
    Card.validateFrontAndBack(input.front, input.back);

    const now = new Date();

    return new Card({
      id: crypto.randomUUID(),
      subjectId: input.subjectId,
      topicId: input.topicId ?? null,
      front: input.front.trim(),
      back: input.back.trim(),
      hint: input.hint?.trim() || null,
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
    hint?: string | null;
    tag?: string;
    status?: CardStatus;
    position?: number;
  }): void {
    const nextFront = input.front ?? this.props.front;
    const nextBack = input.back ?? this.props.back;
    Card.validateFrontAndBack(nextFront, nextBack);

    if (input.front !== undefined) this.props.front = input.front.trim();
    if (input.back !== undefined) this.props.back = input.back.trim();
    if (input.hint !== undefined) this.props.hint = input.hint?.trim() || null;
    if (input.tag !== undefined) this.props.tag = input.tag.trim() || 'Conceito';
    if (input.status !== undefined) this.props.status = input.status;
    if (input.position !== undefined) this.props.position = input.position;
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
  get front() {
    return this.props.front;
  }
  get back() {
    return this.props.back;
  }
  get hint() {
    return this.props.hint;
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
