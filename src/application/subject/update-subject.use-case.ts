import { Subject } from '../../domain/subject/subject.entity';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { DomainError } from '../../domain/shared/domain.error';

export class UpdateSubjectUseCase {
  constructor(private readonly subjects: SubjectRepository) {}

  async execute(
    id: string,
    input: { name?: string; description?: string | null; color?: string },
  ): Promise<Subject> {
    const subject = await this.subjects.findById(id);
    if (!subject) {
      throw new DomainError('SUBJECT_NOT_FOUND', 'Subject not found');
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new DomainError('SUBJECT_NAME_REQUIRED', 'Subject name is required');
    }

    subject.update({
      name: input.name?.trim(),
      description:
        input.description === undefined
          ? undefined
          : input.description?.trim() || null,
      color: input.color,
    });

    return this.subjects.save(subject);
  }
}
