import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CreateTopicUseCase } from '../../../application/topic/create-topic.use-case';
import { ListTopicTreeUseCase } from '../../../application/topic/list-topic-tree.use-case';
import { UpdateTopicUseCase } from '../../../application/topic/update-topic.use-case';
import { DeleteTopicUseCase } from '../../../application/topic/delete-topic.use-case';
import { MoveTopicUseCase } from '../../../application/topic/move-topic.use-case';
import { CreateTopicDto, UpdateTopicDto } from './topic.dto';
import { Topic } from '../../../domain/topic/topic.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

class MoveTopicDto {
  @IsOptional()
  @IsString()
  beforeTopicId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicController {
  constructor(
    @Inject(CreateTopicUseCase)
    private readonly createTopic: CreateTopicUseCase,
    @Inject(ListTopicTreeUseCase)
    private readonly listTopicTree: ListTopicTreeUseCase,
    @Inject(UpdateTopicUseCase)
    private readonly updateTopic: UpdateTopicUseCase,
    @Inject(DeleteTopicUseCase)
    private readonly deleteTopic: DeleteTopicUseCase,
    @Inject(MoveTopicUseCase)
    private readonly moveTopic: MoveTopicUseCase,
  ) {}

  @Get()
  async tree(
    @CurrentUser() user: AuthUser,
    @Query('subjectId') subjectId: string,
  ) {
    return this.listTopicTree.execute(user.id, subjectId);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateTopicDto) {
    return this.toResponse(await this.createTopic.execute(user.id, dto));
  }

  @Post(':id/move')
  async move(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: MoveTopicDto,
  ) {
    return this.toResponse(await this.moveTopic.execute(user.id, id, dto));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.toResponse(await this.updateTopic.execute(user.id, id, dto));
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.deleteTopic.execute(user.id, id);
    return { ok: true };
  }

  private toResponse(topic: Topic) {
    return {
      id: topic.id,
      subjectId: topic.subjectId,
      parentId: topic.parentId,
      name: topic.name,
      description: topic.description,
      color: topic.color,
      position: topic.position,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };
  }
}
