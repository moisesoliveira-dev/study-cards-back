import { FlowBoard } from '../../domain/flow/flow-board.entity';
import { FlowBoardRepository } from '../../domain/flow/flow-board.repository';
import { CardRepository } from '../../domain/card/card.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class GetFlowBoardUseCase {
  constructor(
    private readonly flows: FlowBoardRepository,
    private readonly cards: CardRepository,
  ) {}

  async execute(userId: string, id: string): Promise<FlowBoard> {
    const board = await this.flows.findByIdForUser(id, userId);
    if (!board) {
      throw new DomainError('FLOW_NOT_FOUND', 'Flow not found');
    }

    const existing = await this.cards.findBySubjectId(board.subjectId);
    const existingIds = new Set(existing.map((c) => c.id));
    if (board.pruneMissingCards(existingIds)) {
      return this.flows.save(board);
    }
    return board;
  }
}
