import { Subject } from '../../domain/subject/subject.entity';
import { SubjectRepository } from '../../domain/subject/subject.repository';

export class ListSubjectsUseCase {
  constructor(private readonly subjects: SubjectRepository) {}

  execute(userId: string): Promise<Subject[]> {
    return this.subjects.findByUserId(userId);
  }
}
