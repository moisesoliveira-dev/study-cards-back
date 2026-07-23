import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class MergeCardsUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
  ) {}

  async execute(input: {
    topicId: string;
    sourceCardIds: string[];
    front: string;
    back: string;
    hint?: string | null;
    tag?: string;
  }): Promise<Card> {
    const uniqueIds = [...new Set(input.sourceCardIds.filter(Boolean))];
    if (uniqueIds.length < 2) {
      throw new DomainError(
        'MERGE_MIN_CARDS',
        'Selecione pelo menos 2 cards para unir',
      );
    }

    const topic = await this.topics.findById(input.topicId);
    if (!topic) {
      throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
    }

    const sources = await this.cards.findByIds(uniqueIds);
    if (sources.length !== uniqueIds.length) {
      throw new DomainError('CARD_NOT_FOUND', 'One or more source cards not found');
    }

    const existing = await this.cards.findByTopicId(input.topicId);
    const position = existing.length
      ? Math.max(...existing.map((c) => c.position)) + 1
      : 0;

    const merged = Card.create({
      topicId: input.topicId,
      front: input.front,
      back: input.back,
      hint: input.hint,
      tag: input.tag ?? 'Síntese',
      status: 'NEW',
      position,
    });

    const saved = await this.cards.save(merged);
    await this.cards.linkSources(saved.id, uniqueIds);

    return saved.withMeta({
      linkCount: uniqueIds.length,
      sourceIds: uniqueIds,
    });
  }
}
