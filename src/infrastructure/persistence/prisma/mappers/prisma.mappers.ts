import { User } from '../../../../domain/user/user.entity';
import { Subject } from '../../../../domain/subject/subject.entity';
import { Topic } from '../../../../domain/topic/topic.entity';
import { Card, CardStatus } from '../../../../domain/card/card.entity';
import {
  User as PrismaUser,
  Subject as PrismaSubject,
  Topic as PrismaTopic,
  Card as PrismaCard,
} from '@prisma/client';

export class UserMapper {
  static toDomain(row: PrismaUser): User {
    return User.reconstitute({
      id: row.id,
      email: row.email,
      username: row.username,
      passwordHash: row.passwordHash,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export class SubjectMapper {
  static toDomain(row: PrismaSubject): Subject {
    return Subject.reconstitute({
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(subject: Subject) {
    return {
      id: subject.id,
      userId: subject.userId,
      name: subject.name,
      description: subject.description,
      color: subject.color,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }
}

export class TopicMapper {
  static toDomain(row: PrismaTopic): Topic {
    return Topic.reconstitute({
      id: row.id,
      subjectId: row.subjectId,
      parentId: row.parentId,
      name: row.name,
      description: row.description,
      position: row.position,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(topic: Topic) {
    return {
      id: topic.id,
      subjectId: topic.subjectId,
      parentId: topic.parentId,
      name: topic.name,
      description: topic.description,
      position: topic.position,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };
  }
}

export class CardMapper {
  static toDomain(
    row: PrismaCard,
    meta?: { linkCount?: number; sourceIds?: string[] },
  ): Card {
    return Card.reconstitute({
      id: row.id,
      subjectId: row.subjectId,
      topicId: row.topicId,
      front: row.front,
      back: row.back,
      document: row.document,
      hint: row.hint,
      tag: row.tag,
      status: row.status as CardStatus,
      position: row.position,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      linkCount: meta?.linkCount ?? 0,
      sourceIds: meta?.sourceIds ?? [],
    });
  }

  static toPersistence(card: Card) {
    return {
      id: card.id,
      subjectId: card.subjectId,
      topicId: card.topicId,
      front: card.front,
      back: card.back,
      document: card.document,
      hint: card.hint,
      tag: card.tag,
      status: card.status,
      position: card.position,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }
}
