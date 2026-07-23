import { FlowBoard } from '../../domain/flow/flow-board.entity';
import { FlowBoardRepository } from '../../domain/flow/flow-board.repository';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class CreateFlowBoardUseCase {
  constructor(
    private readonly flows: FlowBoardRepository,
    private readonly subjects: SubjectRepository,
  ) {}

  async execute(
    userId: string,
    input: { subjectId: string; name: string },
  ): Promise<FlowBoard> {
    const subject = await this.subjects.findByIdForUser(
      input.subjectId,
      userId,
    );
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }
    const board = FlowBoard.create({
      userId,
      subjectId: subject.id,
      name: input.name,
    });
    return this.flows.save(board);
  }
}
