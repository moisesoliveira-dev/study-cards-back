import { FlowBoard } from './flow-board.entity';

export interface FlowBoardRepository {
  save(board: FlowBoard): Promise<FlowBoard>;
  findByIdForUser(id: string, userId: string): Promise<FlowBoard | null>;
  findByUser(userId: string): Promise<FlowBoard[]>;
  findBySubjectForUser(
    subjectId: string,
    userId: string,
  ): Promise<FlowBoard[]>;
  delete(id: string): Promise<void>;
}
