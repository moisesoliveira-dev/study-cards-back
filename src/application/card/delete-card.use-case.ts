import { CardRepository } from '../../domain/card/card.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { FlowBoardRepository } from '../../domain/flow/flow-board.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class DeleteCardUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly subjects: SubjectRepository,
    private readonly flows: FlowBoardRepository,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
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

    const boards = await this.flows.findBySubjectForUser(
      card.subjectId,
      userId,
    );
    for (const board of boards) {
      if (board.removeCardReferences(id)) {
        await this.flows.save(board);
      }
    }

    await this.cards.delete(id);
  }
}
