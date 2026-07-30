import { Card } from '../../domain/card/card.entity';
import { CardRepository } from '../../domain/card/card.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DeckRepository } from '../../domain/deck/deck.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class MoveCardUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly topics: TopicRepository,
    private readonly subjects: SubjectRepository,
    private readonly decks: DeckRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    input: {
      topicId?: string | null;
      deckId?: string | null;
      beforeCardId?: string | null;
      position?: number;
    },
  ): Promise<Card> {
    const card = await this.cards.findById(id);
    if (!card) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }

    const subject = await this.subjects.findByIdForUser(
      card.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('CARD_NOT_FOUND', 'Card not found');
    }

    const topicId =
      input.topicId === undefined ? card.topicId : input.topicId;
    let deckId =
      input.deckId === undefined ? card.deckId : input.deckId;

    if (topicId) {
      const topic = await this.topics.findById(topicId);
      if (!topic || topic.subjectId !== card.subjectId) {
        throw new DomainError(
          'TOPIC_NOT_FOUND',
          'Pasta de destino inválida',
        );
      }
    }

    // Mudou de pasta → sai do deck anterior
    if (topicId !== card.topicId) {
      deckId = input.deckId === undefined ? null : deckId;
    }

    if (deckId) {
      const deck = await this.decks.findById(deckId);
      if (
        !deck ||
        deck.subjectId !== card.subjectId ||
        deck.topicId !== topicId
      ) {
        throw new DomainError('DECK_NOT_FOUND', 'Deck de destino inválido');
      }
    }

    const siblings = (
      topicId
        ? await this.cards.findByTopicId(topicId)
        : await this.cards.findRootBySubjectId(card.subjectId)
    ).filter((c) => c.deckId === deckId && c.id !== card.id);

    let position = input.position;
    if (position === undefined && input.beforeCardId) {
      const before = siblings.find((c) => c.id === input.beforeCardId);
      position = before ? before.position : undefined;
    }
    if (position === undefined) {
      position = siblings.length
        ? Math.max(...siblings.map((c) => c.position)) + 1
        : 0;
    }

    // Empurra siblings à frente quando inserindo antes de alguém
    if (input.beforeCardId) {
      const ordered = [...siblings].sort((a, b) => a.position - b.position);
      let next = position;
      for (const sibling of ordered) {
        if (sibling.position >= position) {
          next += 1;
          sibling.update({ position: next });
          await this.cards.save(sibling);
        }
      }
    }

    card.update({ topicId, deckId, position });
    return this.cards.save(card);
  }
}
