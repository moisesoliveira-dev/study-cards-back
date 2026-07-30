import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { CardLevelRepository } from '../../domain/card/card-level.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DeckRepository } from '../../domain/deck/deck.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class CreateCardUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
    private readonly levels: CardLevelRepository,
    private readonly decks: DeckRepository,
  ) {}

  async execute(
    userId: string,
    input: {
      subjectId?: string;
      topicId?: string | null;
      deckId?: string | null;
      front: string;
      back: string;
      document?: string | null;
      levelId?: string | null;
      icon?: string | null;
      color?: string | null;
      tag?: string;
      position?: number;
    },
  ): Promise<Card> {
    let subjectId = input.subjectId?.trim() || '';
    const topicId = input.topicId?.trim() || null;
    let deckId = input.deckId?.trim() || null;

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
          'Informe o grupo (subjectId) para criar o card na raiz',
        );
      }
      const subject = await this.subjects.findByIdForUser(subjectId, userId);
      if (!subject) {
        throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
      }
    }

    if (deckId) {
      const deck = await this.decks.findById(deckId);
      if (
        !deck ||
        deck.subjectId !== subjectId ||
        deck.topicId !== topicId
      ) {
        throw new DomainError('DECK_NOT_FOUND', 'Deck de destino inválido');
      }
    }

    const siblings = (
      topicId
        ? await this.cards.findByTopicId(topicId)
        : await this.cards.findRootBySubjectId(subjectId)
    ).filter((c) => c.deckId === deckId);

    const position =
      input.position ??
      (siblings.length
        ? Math.max(...siblings.map((c) => c.position)) + 1
        : 0);

    const levelId = await this.resolveLevelId(input.levelId);

    const card = Card.create({
      subjectId,
      topicId,
      deckId,
      front: input.front,
      back: input.back,
      document: input.document,
      levelId,
      icon: input.icon,
      color: input.color,
      tag: input.tag,
      position,
    });

    return this.cards.save(card);
  }

  private async resolveLevelId(
    levelId?: string | null,
  ): Promise<string | null> {
    const requested = levelId?.trim() || null;
    if (requested) {
      const found = await this.levels.findById(requested);
      if (!found) {
        throw new DomainError('CARD_LEVEL_NOT_FOUND', 'Nível não encontrado');
      }
      return found.id;
    }
    const basic = await this.levels.findBySlug('basic');
    if (basic) return basic.id;
    const all = await this.levels.findAll();
    return all[0]?.id ?? null;
  }
}
