import { Subject } from '../../domain/subject/subject.entity';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class GetSubjectUseCase {
  constructor(private readonly subjects: SubjectRepository) {}

  async execute(userId: string, id: string): Promise<Subject> {
    const subject = await this.subjects.findByIdForUser(id, userId);
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }
    return subject;
  }
}
