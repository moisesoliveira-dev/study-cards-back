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
import { CreateFlowBoardUseCase } from '../../../application/flow/create-flow-board.use-case';
import { ListFlowBoardsUseCase } from '../../../application/flow/list-flow-boards.use-case';
import { GetFlowBoardUseCase } from '../../../application/flow/get-flow-board.use-case';
import { UpdateFlowBoardUseCase } from '../../../application/flow/update-flow-board.use-case';
import { DeleteFlowBoardUseCase } from '../../../application/flow/delete-flow-board.use-case';
import { CreateFlowBoardDto, UpdateFlowBoardDto } from './flow.dto';
import { FlowBoard, FlowEdge, FlowNode } from '../../../domain/flow/flow-board.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('flows')
@UseGuards(JwtAuthGuard)
export class FlowController {
  constructor(
    @Inject(CreateFlowBoardUseCase)
    private readonly createFlow: CreateFlowBoardUseCase,
    @Inject(ListFlowBoardsUseCase)
    private readonly listFlows: ListFlowBoardsUseCase,
    @Inject(GetFlowBoardUseCase)
    private readonly getFlow: GetFlowBoardUseCase,
    @Inject(UpdateFlowBoardUseCase)
    private readonly updateFlow: UpdateFlowBoardUseCase,
    @Inject(DeleteFlowBoardUseCase)
    private readonly deleteFlow: DeleteFlowBoardUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query('subjectId') subjectId?: string,
  ) {
    const boards = await this.listFlows.execute(user.id, subjectId);
    return boards.map((b) => this.toResponse(b));
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.toResponse(await this.getFlow.execute(user.id, id));
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateFlowBoardDto,
  ) {
    return this.toResponse(await this.createFlow.execute(user.id, dto));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateFlowBoardDto,
  ) {
    return this.toResponse(
      await this.updateFlow.execute(user.id, id, {
        name: dto.name,
        nodes: dto.nodes as FlowNode[] | undefined,
        edges: dto.edges as FlowEdge[] | undefined,
      }),
    );
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.deleteFlow.execute(user.id, id);
    return { ok: true };
  }

  private toResponse(board: FlowBoard) {
    return {
      id: board.id,
      userId: board.userId,
      subjectId: board.subjectId,
      name: board.name,
      nodes: Array.isArray(board.nodes) ? board.nodes : [],
      edges: Array.isArray(board.edges) ? board.edges : [],
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
