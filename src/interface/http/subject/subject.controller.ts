import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateSubjectUseCase } from '../../../application/subject/create-subject.use-case';
import { ListSubjectsUseCase } from '../../../application/subject/list-subjects.use-case';
import { GetSubjectUseCase } from '../../../application/subject/get-subject.use-case';
import { UpdateSubjectUseCase } from '../../../application/subject/update-subject.use-case';
import { DeleteSubjectUseCase } from '../../../application/subject/delete-subject.use-case';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';
import { Subject } from '../../../domain/subject/subject.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectController {
  constructor(
    @Inject(CreateSubjectUseCase)
    private readonly createSubject: CreateSubjectUseCase,
    @Inject(ListSubjectsUseCase)
    private readonly listSubjects: ListSubjectsUseCase,
    @Inject(GetSubjectUseCase)
    private readonly getSubject: GetSubjectUseCase,
    @Inject(UpdateSubjectUseCase)
    private readonly updateSubject: UpdateSubjectUseCase,
    @Inject(DeleteSubjectUseCase)
    private readonly deleteSubject: DeleteSubjectUseCase,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const subjects = await this.listSubjects.execute(user.id);
    return subjects.map(this.toResponse);
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.toResponse(await this.getSubject.execute(user.id, id));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateSubjectDto) {
    return this.toResponse(await this.createSubject.execute(user.id, dto));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.toResponse(await this.updateSubject.execute(user.id, id, dto));
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.deleteSubject.execute(user.id, id);
    return { ok: true };
  }

  private toResponse(subject: Subject) {
    return {
      id: subject.id,
      name: subject.name,
      description: subject.description,
      color: subject.color,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }
}
