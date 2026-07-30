import { Deck } from '../../domain/deck/deck.entity';
import { DeckRepository } from '../../domain/deck/deck.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class CreateDeckUseCase {
  constructor(
    private readonly decks: DeckRepository,
    private readonly subjects: SubjectRepository,
    private readonly topics: TopicRepository,
  ) {}

  async execute(
    userId: string,
    input: {
      subjectId: string;
      topicId?: string | null;
      name: string;
      description?: string | null;
      color?: string;
    },
  ): Promise<Deck> {
    const name = input.name?.trim();
    if (!name) {
      throw new DomainError('DECK_NAME_REQUIRED', 'Deck name is required');
    }

    const subject = await this.subjects.findByIdForUser(
      input.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }

    const topicId = input.topicId ?? null;
    if (topicId) {
      const topic = await this.topics.findById(topicId);
      if (!topic || topic.subjectId !== input.subjectId) {
        throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
      }
    }

    const siblings = await this.decks.findByLocation(
      input.subjectId,
      topicId,
    );
    const position = siblings.length
      ? Math.max(...siblings.map((d) => d.position)) + 1
      : 0;

    return this.decks.save(
      Deck.create({
        subjectId: input.subjectId,
        topicId,
        name,
        description: input.description,
        color: input.color,
        position,
      }),
    );
  }
}

export class ListDecksUseCase {
  constructor(
    private readonly decks: DeckRepository,
    private readonly subjects: SubjectRepository,
    private readonly topics: TopicRepository,
  ) {}

  async execute(
    userId: string,
    query: { subjectId: string; topicId?: string | null },
  ): Promise<Deck[]> {
    const subject = await this.subjects.findByIdForUser(
      query.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }

    const topicId =
      query.topicId === undefined ? null : query.topicId;
    if (topicId) {
      const topic = await this.topics.findById(topicId);
      if (!topic || topic.subjectId !== query.subjectId) {
        throw new DomainError('TOPIC_NOT_FOUND', 'Topic not found');
      }
    }

    return this.decks.findByLocation(query.subjectId, topicId);
  }
}

export class UpdateDeckUseCase {
  constructor(
    private readonly decks: DeckRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    input: {
      name?: string;
      description?: string | null;
      color?: string;
      position?: number;
    },
  ): Promise<Deck> {
    const deck = await this.decks.findById(id);
    if (!deck) {
      throw new DomainError('DECK_NOT_FOUND', 'Deck not found');
    }
    const subject = await this.subjects.findByIdForUser(
      deck.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('DECK_NOT_FOUND', 'Deck not found');
    }
    if (input.name !== undefined && !input.name.trim()) {
      throw new DomainError('DECK_NAME_REQUIRED', 'Deck name is required');
    }
    deck.update({
      name: input.name?.trim(),
      description:
        input.description === undefined
          ? undefined
          : input.description?.trim() || null,
      color: input.color,
      position: input.position,
    });
    return this.decks.save(deck);
  }
}

export class DeleteDeckUseCase {
  constructor(
    private readonly decks: DeckRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const deck = await this.decks.findById(id);
    if (!deck) {
      throw new DomainError('DECK_NOT_FOUND', 'Deck not found');
    }
    const subject = await this.subjects.findByIdForUser(
      deck.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('DECK_NOT_FOUND', 'Deck not found');
    }
    await this.decks.delete(id);
  }
}

export class MoveDeckUseCase {
  constructor(
    private readonly decks: DeckRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    input: {
      beforeDeckId?: string | null;
      position?: number;
    },
  ): Promise<Deck> {
    const deck = await this.decks.findById(id);
    if (!deck) {
      throw new DomainError('DECK_NOT_FOUND', 'Deck not found');
    }
    const subject = await this.subjects.findByIdForUser(
      deck.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('DECK_NOT_FOUND', 'Deck not found');
    }

    const siblings = (
      await this.decks.findByLocation(deck.subjectId, deck.topicId)
    ).filter((d) => d.id !== deck.id);

    let position = input.position;
    if (position === undefined && input.beforeDeckId) {
      const before = siblings.find((d) => d.id === input.beforeDeckId);
      position = before ? before.position : undefined;
    }
    if (position === undefined) {
      position = siblings.length
        ? Math.max(...siblings.map((d) => d.position)) + 1
        : 0;
    }

    if (input.beforeDeckId) {
      const ordered = [...siblings].sort((a, b) => a.position - b.position);
      let next = position;
      for (const sibling of ordered) {
        if (sibling.position >= position) {
          next += 1;
          sibling.update({ position: next });
          await this.decks.save(sibling);
        }
      }
    }

    deck.update({ position });
    return this.decks.save(deck);
  }
}
