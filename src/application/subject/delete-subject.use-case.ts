import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class DeleteSubjectUseCase {
  constructor(private readonly subjects: SubjectRepository) {}

  async execute(id: string): Promise<void> {
    const subject = await this.subjects.findById(id);
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }
    await this.subjects.delete(id);
  }
}
