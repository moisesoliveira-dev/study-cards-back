import { Module } from '@nestjs/common';
import { SubjectController } from './subject/subject.controller';
import { TopicController } from './topic/topic.controller';
import { CardController } from './card/card.controller';
import { HealthController } from './health/health.controller';
import { CreateSubjectUseCase } from '../../application/subject/create-subject.use-case';
import { ListSubjectsUseCase } from '../../application/subject/list-subjects.use-case';
import { GetSubjectUseCase } from '../../application/subject/get-subject.use-case';
import { UpdateSubjectUseCase } from '../../application/subject/update-subject.use-case';
import { DeleteSubjectUseCase } from '../../application/subject/delete-subject.use-case';
import { CreateTopicUseCase } from '../../application/topic/create-topic.use-case';
import { ListTopicTreeUseCase } from '../../application/topic/list-topic-tree.use-case';
import { UpdateTopicUseCase } from '../../application/topic/update-topic.use-case';
import { DeleteTopicUseCase } from '../../application/topic/delete-topic.use-case';
import { CreateCardUseCase } from '../../application/card/create-card.use-case';
import { ListCardsByTopicUseCase } from '../../application/card/list-cards-by-topic.use-case';
import { GetStudyDeckUseCase } from '../../application/card/get-study-deck.use-case';
import { UpdateCardUseCase } from '../../application/card/update-card.use-case';
import { DeleteCardUseCase } from '../../application/card/delete-card.use-case';
import { MergeCardsUseCase } from '../../application/card/merge-cards.use-case';
import {
  SUBJECT_REPOSITORY,
  TOPIC_REPOSITORY,
  CARD_REPOSITORY,
} from '../../domain/tokens';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { CardRepository } from '../../domain/card/card.repository';

@Module({
  controllers: [
    HealthController,
    SubjectController,
    TopicController,
    CardController,
  ],
  providers: [
    {
      provide: CreateSubjectUseCase,
      useFactory: (repo: SubjectRepository) => new CreateSubjectUseCase(repo),
      inject: [SUBJECT_REPOSITORY],
    },
    {
      provide: ListSubjectsUseCase,
      useFactory: (repo: SubjectRepository) => new ListSubjectsUseCase(repo),
      inject: [SUBJECT_REPOSITORY],
    },
    {
      provide: GetSubjectUseCase,
      useFactory: (repo: SubjectRepository) => new GetSubjectUseCase(repo),
      inject: [SUBJECT_REPOSITORY],
    },
    {
      provide: UpdateSubjectUseCase,
      useFactory: (repo: SubjectRepository) => new UpdateSubjectUseCase(repo),
      inject: [SUBJECT_REPOSITORY],
    },
    {
      provide: DeleteSubjectUseCase,
      useFactory: (repo: SubjectRepository) => new DeleteSubjectUseCase(repo),
      inject: [SUBJECT_REPOSITORY],
    },
    {
      provide: CreateTopicUseCase,
      useFactory: (topics: TopicRepository, subjects: SubjectRepository) =>
        new CreateTopicUseCase(topics, subjects),
      inject: [TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: ListTopicTreeUseCase,
      useFactory: (topics: TopicRepository, subjects: SubjectRepository) =>
        new ListTopicTreeUseCase(topics, subjects),
      inject: [TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: UpdateTopicUseCase,
      useFactory: (repo: TopicRepository) => new UpdateTopicUseCase(repo),
      inject: [TOPIC_REPOSITORY],
    },
    {
      provide: DeleteTopicUseCase,
      useFactory: (repo: TopicRepository) => new DeleteTopicUseCase(repo),
      inject: [TOPIC_REPOSITORY],
    },
    {
      provide: CreateCardUseCase,
      useFactory: (cards: CardRepository, topics: TopicRepository) =>
        new CreateCardUseCase(cards, topics),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY],
    },
    {
      provide: ListCardsByTopicUseCase,
      useFactory: (cards: CardRepository, topics: TopicRepository) =>
        new ListCardsByTopicUseCase(cards, topics),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY],
    },
    {
      provide: GetStudyDeckUseCase,
      useFactory: (cards: CardRepository, topics: TopicRepository) =>
        new GetStudyDeckUseCase(cards, topics),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY],
    },
    {
      provide: UpdateCardUseCase,
      useFactory: (repo: CardRepository) => new UpdateCardUseCase(repo),
      inject: [CARD_REPOSITORY],
    },
    {
      provide: DeleteCardUseCase,
      useFactory: (repo: CardRepository) => new DeleteCardUseCase(repo),
      inject: [CARD_REPOSITORY],
    },
    {
      provide: MergeCardsUseCase,
      useFactory: (cards: CardRepository, topics: TopicRepository) =>
        new MergeCardsUseCase(cards, topics),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY],
    },
  ],
})
export class HttpModule {}
