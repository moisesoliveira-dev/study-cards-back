import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SubjectPrismaRepository } from './subject.prisma-repository';
import { TopicPrismaRepository } from './topic.prisma-repository';
import { CardPrismaRepository } from './card.prisma-repository';
import { UserPrismaRepository } from './user.prisma-repository';
import {
  SUBJECT_REPOSITORY,
  TOPIC_REPOSITORY,
  CARD_REPOSITORY,
  USER_REPOSITORY,
} from '../../../domain/tokens';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
    { provide: SUBJECT_REPOSITORY, useClass: SubjectPrismaRepository },
    { provide: TOPIC_REPOSITORY, useClass: TopicPrismaRepository },
    { provide: CARD_REPOSITORY, useClass: CardPrismaRepository },
  ],
  exports: [
    PrismaService,
    USER_REPOSITORY,
    SUBJECT_REPOSITORY,
    TOPIC_REPOSITORY,
    CARD_REPOSITORY,
  ],
})
export class PersistenceModule {}