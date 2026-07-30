import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SubjectPrismaRepository } from './subject.prisma-repository';
import { TopicPrismaRepository } from './topic.prisma-repository';
import { CardPrismaRepository } from './card.prisma-repository';
import { CardLevelPrismaRepository } from './card-level.prisma-repository';
import { DeckPrismaRepository } from './deck.prisma-repository';
import { DocumentNotePrismaRepository } from './document-note.prisma-repository';
import { UserPrismaRepository } from './user.prisma-repository';
import { FlowBoardPrismaRepository } from './flow-board.prisma-repository';
import {
  SUBJECT_REPOSITORY,
  TOPIC_REPOSITORY,
  CARD_REPOSITORY,
  CARD_LEVEL_REPOSITORY,
  DECK_REPOSITORY,
  DOCUMENT_NOTE_REPOSITORY,
  USER_REPOSITORY,
  FLOW_BOARD_REPOSITORY,
} from '../../../domain/tokens';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
    { provide: SUBJECT_REPOSITORY, useClass: SubjectPrismaRepository },
    { provide: TOPIC_REPOSITORY, useClass: TopicPrismaRepository },
    { provide: CARD_REPOSITORY, useClass: CardPrismaRepository },
    { provide: CARD_LEVEL_REPOSITORY, useClass: CardLevelPrismaRepository },
    { provide: DECK_REPOSITORY, useClass: DeckPrismaRepository },
    { provide: DOCUMENT_NOTE_REPOSITORY, useClass: DocumentNotePrismaRepository },
    { provide: FLOW_BOARD_REPOSITORY, useClass: FlowBoardPrismaRepository },
  ],
  exports: [
    PrismaService,
    USER_REPOSITORY,
    SUBJECT_REPOSITORY,
    TOPIC_REPOSITORY,
    CARD_REPOSITORY,
    CARD_LEVEL_REPOSITORY,
    DECK_REPOSITORY,
    DOCUMENT_NOTE_REPOSITORY,
    FLOW_BOARD_REPOSITORY,
  ],
})
export class PersistenceModule {}
