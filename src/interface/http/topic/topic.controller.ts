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
} from '@nestjs/common';
import { CreateTopicUseCase } from '../../../application/topic/create-topic.use-case';
import { ListTopicTreeUseCase } from '../../../application/topic/list-topic-tree.use-case';
import { UpdateTopicUseCase } from '../../../application/topic/update-topic.use-case';
import { DeleteTopicUseCase } from '../../../application/topic/delete-topic.use-case';
import { CreateTopicDto, UpdateTopicDto } from './topic.dto';
import { Topic } from '../../../domain/topic/topic.entity';

@Controller('topics')
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
  ) {}

  @Get()
  async tree(@Query('subjectId') subjectId: string) {
    return this.listTopicTree.execute(subjectId);
  }

  @Post()
  async create(@Body() dto: CreateTopicDto) {
    return this.toResponse(await this.createTopic.execute(dto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.toResponse(await this.updateTopic.execute(id, dto));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteTopic.execute(id);
    return { ok: true };
  }

  private toResponse(topic: Topic) {
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
