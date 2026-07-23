import { FlowBoardRepository } from '../../domain/flow/flow-board.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class DeleteFlowBoardUseCase {
  constructor(private readonly flows: FlowBoardRepository) {}

  async execute(userId: string, id: string): Promise<void> {
    const board = await this.flows.findByIdForUser(id, userId);
    if (!board) {
      throw new DomainError('FLOW_NOT_FOUND', 'Flow not found');
    }
    await this.flows.delete(id);
  }
}
