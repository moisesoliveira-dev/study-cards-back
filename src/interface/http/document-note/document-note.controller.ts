import {
  BadRequestException,
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
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateDocumentNoteUseCase,
  DeleteDocumentNoteUseCase,
  ListDocumentNotesUseCase,
  UpdateDocumentNoteUseCase,
} from '../../../application/document-note/document-note.use-cases';
import { DocumentNote } from '../../../domain/document-note/document-note.entity';
import { DomainError } from '../../../domain/shared/domain.error';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

class CreateDocumentNoteDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fromPos!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  toPos!: number;

  @IsString()
  @MinLength(1)
  content!: string;
}

class UpdateDocumentNoteDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fromPos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  toPos?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}

@Controller('cards/:cardId/notes')
@UseGuards(JwtAuthGuard)
export class DocumentNoteController {
  constructor(
    @Inject(ListDocumentNotesUseCase)
    private readonly listNotes: ListDocumentNotesUseCase,
    @Inject(CreateDocumentNoteUseCase)
    private readonly createNote: CreateDocumentNoteUseCase,
    @Inject(UpdateDocumentNoteUseCase)
    private readonly updateNote: UpdateDocumentNoteUseCase,
    @Inject(DeleteDocumentNoteUseCase)
    private readonly deleteNote: DeleteDocumentNoteUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Param('cardId') cardId: string,
  ) {
    const notes = await this.listNotes.execute(user.id, cardId);
    return notes.map((n) => this.toResponse(n));
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Param('cardId') cardId: string,
    @Body() dto: CreateDocumentNoteDto,
  ) {
    try {
      return this.toResponse(
        await this.createNote.execute(user.id, cardId, dto),
      );
    } catch (error) {
      this.rethrowDomain(error);
    }
  }

  @Patch(':noteId')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('cardId') cardId: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateDocumentNoteDto,
  ) {
    try {
      return this.toResponse(
        await this.updateNote.execute(user.id, cardId, noteId, dto),
      );
    } catch (error) {
      this.rethrowDomain(error);
    }
  }

  @Delete(':noteId')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('cardId') cardId: string,
    @Param('noteId') noteId: string,
  ) {
    await this.deleteNote.execute(user.id, cardId, noteId);
    return { ok: true };
  }

  private toResponse(note: DocumentNote) {
    return {
      id: note.id,
      cardId: note.cardId,
      fromPos: note.fromPos,
      toPos: note.toPos,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  private rethrowDomain(error: unknown): never {
    if (error instanceof DomainError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
