import { Subject } from './subject.entity';

export interface SubjectRepository {
  save(subject: Subject): Promise<Subject>;
  findById(id: string): Promise<Subject | null>;
  findByIdForUser(id: string, userId: string): Promise<Subject | null>;
  findByUserId(userId: string): Promise<Subject[]>;
  delete(id: string): Promise<void>;
}
