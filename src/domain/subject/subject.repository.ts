import { Subject } from './subject.entity';

export interface SubjectRepository {
  save(subject: Subject): Promise<Subject>;
  findById(id: string): Promise<Subject | null>;
  findAll(): Promise<Subject[]>;
  delete(id: string): Promise<void>;
}
