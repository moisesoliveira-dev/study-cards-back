import { Subject } from '../../domain/subject/subject.entity';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class GetSubjectUseCase {
  constructor(private readonly subjects: SubjectRepository) {}

  async execute(id: string): Promise<Subject> {
    const subject = await this.subjects.findById(id);
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }
    return subject;
  }
}
