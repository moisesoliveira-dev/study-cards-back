import { FlowBoard } from '../../domain/flow/flow-board.entity';
import { FlowBoardRepository } from '../../domain/flow/flow-board.repository';

export class ListFlowBoardsUseCase {
  constructor(private readonly flows: FlowBoardRepository) {}

  execute(userId: string, subjectId?: string): Promise<FlowBoard[]> {
    if (subjectId) {
      return this.flows.findBySubjectForUser(subjectId, userId);
    }
    return this.flows.findByUser(userId);
  }
}
