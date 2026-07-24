import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SubjectController } from './subject/subject.controller';
import { TopicController } from './topic/topic.controller';
import { CardController } from './card/card.controller';
import { FlowController } from './flow/flow.controller';
import { HealthController } from './health/health.controller';
import { AuthController } from './auth/auth.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
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
import { MoveCardUseCase } from '../../application/card/move-card.use-case';
import { GetCardUseCase } from '../../application/card/get-card.use-case';
import { GetCardsByIdsUseCase } from '../../application/card/get-cards-by-ids.use-case';
import { CreateFlowBoardUseCase } from '../../application/flow/create-flow-board.use-case';
import { ListFlowBoardsUseCase } from '../../application/flow/list-flow-boards.use-case';
import { GetFlowBoardUseCase } from '../../application/flow/get-flow-board.use-case';
import { UpdateFlowBoardUseCase } from '../../application/flow/update-flow-board.use-case';
import { DeleteFlowBoardUseCase } from '../../application/flow/delete-flow-board.use-case';
import { RegisterUserUseCase } from '../../application/auth/register-user.use-case';
import { LoginUserUseCase } from '../../application/auth/login-user.use-case';
import { GetCurrentUserUseCase } from '../../application/auth/get-current-user.use-case';
import { UpdateCurrentUserUseCase } from '../../application/auth/update-current-user.use-case';
import { ChangePasswordUseCase } from '../../application/auth/change-password.use-case';
import {
  SUBJECT_REPOSITORY,
  TOPIC_REPOSITORY,
  CARD_REPOSITORY,
  USER_REPOSITORY,
  FLOW_BOARD_REPOSITORY,
} from '../../domain/tokens';
import { SubjectRepository } from '../../domain/subject/subject.repository';
import { TopicRepository } from '../../domain/topic/topic.repository';
import { CardRepository } from '../../domain/card/card.repository';
import { UserRepository } from '../../domain/user/user.repository';
import { FlowBoardRepository } from '../../domain/flow/flow-board.repository';
import { JwtService } from '@nestjs/jwt';
import { TokenSigner } from '../../application/auth/register-user.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me',
        signOptions: {
          expiresIn: Number(config.get('JWT_EXPIRES_SECONDS')) || 60 * 60 * 24 * 7,
        },
      }),
    }),
  ],
  controllers: [
    HealthController,
    AuthController,
    SubjectController,
    TopicController,
    CardController,
    FlowController,
  ],
  providers: [
    JwtAuthGuard,
    {
      provide: RegisterUserUseCase,
      useFactory: (users: UserRepository, jwt: JwtService) => {
        const signer: TokenSigner = {
          sign: (payload) => jwt.signAsync(payload),
        };
        return new RegisterUserUseCase(users, signer);
      },
      inject: [USER_REPOSITORY, JwtService],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (users: UserRepository, jwt: JwtService) => {
        const signer: TokenSigner = {
          sign: (payload) => jwt.signAsync(payload),
        };
        return new LoginUserUseCase(users, signer);
      },
      inject: [USER_REPOSITORY, JwtService],
    },
    {
      provide: GetCurrentUserUseCase,
      useFactory: (users: UserRepository) => new GetCurrentUserUseCase(users),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UpdateCurrentUserUseCase,
      useFactory: (users: UserRepository) =>
        new UpdateCurrentUserUseCase(users),
      inject: [USER_REPOSITORY],
    },
    {
      provide: ChangePasswordUseCase,
      useFactory: (users: UserRepository) => new ChangePasswordUseCase(users),
      inject: [USER_REPOSITORY],
    },
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
      useFactory: (topics: TopicRepository, subjects: SubjectRepository) =>
        new UpdateTopicUseCase(topics, subjects),
      inject: [TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: DeleteTopicUseCase,
      useFactory: (topics: TopicRepository, subjects: SubjectRepository) =>
        new DeleteTopicUseCase(topics, subjects),
      inject: [TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: CreateCardUseCase,
      useFactory: (
        cards: CardRepository,
        topics: TopicRepository,
        subjects: SubjectRepository,
      ) => new CreateCardUseCase(cards, topics, subjects),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: ListCardsByTopicUseCase,
      useFactory: (
        cards: CardRepository,
        topics: TopicRepository,
        subjects: SubjectRepository,
      ) => new ListCardsByTopicUseCase(cards, topics, subjects),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: GetStudyDeckUseCase,
      useFactory: (
        cards: CardRepository,
        topics: TopicRepository,
        subjects: SubjectRepository,
      ) => new GetStudyDeckUseCase(cards, topics, subjects),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: UpdateCardUseCase,
      useFactory: (cards: CardRepository, subjects: SubjectRepository) =>
        new UpdateCardUseCase(cards, subjects),
      inject: [CARD_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: DeleteCardUseCase,
      useFactory: (
        cards: CardRepository,
        subjects: SubjectRepository,
        flows: FlowBoardRepository,
      ) => new DeleteCardUseCase(cards, subjects, flows),
      inject: [CARD_REPOSITORY, SUBJECT_REPOSITORY, FLOW_BOARD_REPOSITORY],
    },
    {
      provide: MergeCardsUseCase,
      useFactory: (
        cards: CardRepository,
        topics: TopicRepository,
        subjects: SubjectRepository,
      ) => new MergeCardsUseCase(cards, topics, subjects),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: MoveCardUseCase,
      useFactory: (
        cards: CardRepository,
        topics: TopicRepository,
        subjects: SubjectRepository,
      ) => new MoveCardUseCase(cards, topics, subjects),
      inject: [CARD_REPOSITORY, TOPIC_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: GetCardUseCase,
      useFactory: (cards: CardRepository, subjects: SubjectRepository) =>
        new GetCardUseCase(cards, subjects),
      inject: [CARD_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: GetCardsByIdsUseCase,
      useFactory: (cards: CardRepository, subjects: SubjectRepository) =>
        new GetCardsByIdsUseCase(cards, subjects),
      inject: [CARD_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: CreateFlowBoardUseCase,
      useFactory: (flows: FlowBoardRepository, subjects: SubjectRepository) =>
        new CreateFlowBoardUseCase(flows, subjects),
      inject: [FLOW_BOARD_REPOSITORY, SUBJECT_REPOSITORY],
    },
    {
      provide: ListFlowBoardsUseCase,
      useFactory: (flows: FlowBoardRepository) =>
        new ListFlowBoardsUseCase(flows),
      inject: [FLOW_BOARD_REPOSITORY],
    },
    {
      provide: GetFlowBoardUseCase,
      useFactory: (flows: FlowBoardRepository) => new GetFlowBoardUseCase(flows),
      inject: [FLOW_BOARD_REPOSITORY],
    },
    {
      provide: UpdateFlowBoardUseCase,
      useFactory: (flows: FlowBoardRepository) =>
        new UpdateFlowBoardUseCase(flows),
      inject: [FLOW_BOARD_REPOSITORY],
    },
    {
      provide: DeleteFlowBoardUseCase,
      useFactory: (flows: FlowBoardRepository) =>
        new DeleteFlowBoardUseCase(flows),
      inject: [FLOW_BOARD_REPOSITORY],
    },
  ],
})
export class HttpModule {}
