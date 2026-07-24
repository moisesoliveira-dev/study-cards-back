import {
  FlowBoard,
  FlowEdge,
  FlowNode,
} from '../../domain/flow/flow-board.entity';
import { FlowBoardRepository } from '../../domain/flow/flow-board.repository';
import { CardRepository } from '../../domain/card/card.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class UpdateFlowBoardUseCase {
  constructor(
    private readonly flows: FlowBoardRepository,
    private readonly cards: CardRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    input: {
      name?: string;
      nodes?: FlowNode[];
      edges?: FlowEdge[];
    },
  ): Promise<FlowBoard> {
    const board = await this.flows.findByIdForUser(id, userId);
    if (!board) {
      throw new DomainError('FLOW_NOT_FOUND', 'Flow not found');
    }

    board.update(input);

    const existing = await this.cards.findBySubjectId(board.subjectId);
    const existingIds = new Set(existing.map((c) => c.id));
    board.pruneMissingCards(existingIds);

    return this.flows.save(board);
  }
}
