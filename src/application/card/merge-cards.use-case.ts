import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class MergeCardsUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    input: {
      subjectId?: string;
      topicId?: string | null;
      sourceCardIds: string[];
      front: string;
      back: string;
      document?: string | null;
      levelId?: string | null;
      icon?: string | null;
      color?: string | null;
      tag?: string;
    },
  ): Promise<Card> {
    const uniqueIds = [...new Set(input.sourceCardIds.filter(Boolean))];
    if (uniqueIds.length < 2) {
      throw new DomainError(
        'MERGE_MIN_CARDS',
        'Selecione pelo menos 2 cards para unir',
      );
    }

    let subjectId = input.subjectId?.trim() || '';
    const topicId = input.topicId?.trim() || null;

    if (topicId) {
      const topic = await this.topics.findById(topicId);
      if (!topic) {
        throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
      }
      const subject = await this.subjects.findByIdForUser(
        topic.subjectId,
        userId,
      );
      if (!subject) {
        throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
      }
      subjectId = topic.subjectId;
    } else {
      if (!subjectId) {
        throw new DomainError(
          'SUBJECT_REQUIRED',
          'Informe o grupo (subjectId) para unir cards na raiz',
        );
      }
      const subject = await this.subjects.findByIdForUser(subjectId, userId);
      if (!subject) {
        throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
      }
    }

    const sources = await this.cards.findByIds(uniqueIds);
    if (sources.length !== uniqueIds.length) {
      throw new DomainError('CARD_NOT_FOUND', 'One or more source cards not found');
    }
    if (sources.some((s) => s.subjectId !== subjectId)) {
      throw new DomainError(
        'CARD_SUBJECT_MISMATCH',
        'Todos os cards devem pertencer ao mesmo grupo',
      );
    }

    const siblings = topicId
      ? await this.cards.findByTopicId(topicId)
      : await this.cards.findRootBySubjectId(subjectId);
    const position = siblings.length
      ? Math.max(...siblings.map((c) => c.position)) + 1
      : 0;

    const merged = Card.create({
      subjectId,
      topicId,
      front: input.front,
      back: input.back,
      document: input.document,
      levelId: input.levelId,
      icon: input.icon,
      color: input.color,
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
