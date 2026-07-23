import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SubjectPrismaRepository } from './subject.prisma-repository';
import { TopicPrismaRepository } from './topic.prisma-repository';
import { CardPrismaRepository } from './card.prisma-repository';
import {
  SUBJECT_REPOSITORY,
  TOPIC_REPOSITORY,
  CARD_REPOSITORY,
} from '../../../domain/tokens';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: SUBJECT_REPOSITORY, useClass: SubjectPrismaRepository },
    { provide: TOPIC_REPOSITORY, useClass: TopicPrismaRepository },
    { provide: CARD_REPOSITORY, useClass: CardPrismaRepository },
  ],
  exports: [
    PrismaService,
    SUBJECT_REPOSITORY,
    TOPIC_REPOSITORY,
    CARD_REPOSITORY,
  ],
})
export class PersistenceModule {}
