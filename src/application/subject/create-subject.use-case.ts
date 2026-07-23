import { Subject } from '../../domain/subject/subject.entity';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class CreateSubjectUseCase {
  constructor(private readonly subjects: SubjectRepository) {}

  async execute(
    userId: string,
    input: {
      name: string;
      description?: string | null;
      color?: string;
    },
  ): Promise<Subject> {
    const name = input.name?.trim();
    if (!name) {
      throw new DomainError('SUBJECT_NAME_REQUIRED', 'Subject name is required');
    }

    const subject = Subject.create({
      userId,
      name,
      description: input.description?.trim() || null,
      color: input.color,
    });

    return this.subjects.save(subject);
  }
}
