import { Subject } from '../../domain/subject/subject.entity';
import { SubjectRepository } from '../../domain/subject/subject.repository';

export class ListSubjectsUseCase {
  constructor(private readonly subjects: SubjectRepository) {}

  execute(): Promise<Subject[]> {
    return this.subjects.findAll();
  }
}
