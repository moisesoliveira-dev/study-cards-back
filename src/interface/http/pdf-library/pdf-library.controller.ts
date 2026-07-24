import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import {
  PdfLibraryService,
  type UploadedPdf,
} from '../../../application/pdf-library/pdf-library.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, type AuthUser } from '../auth/jwt-auth.guard';
import {
  CreatePdfGroupDto,
  UpdatePdfDocumentDto,
  UpdatePdfGroupDto,
  UploadPdfDto,
} from './pdf-library.dto';

@Controller('pdf-library')
@UseGuards(JwtAuthGuard)
export class PdfLibraryController {
  constructor(private readonly library: PdfLibraryService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.library.list(user.id);
  }

  @Post('groups')
  createGroup(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePdfGroupDto,
  ) {
    return this.library.createGroup(user.id, dto);
  }

  @Patch('groups/:id')
  updateGroup(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePdfGroupDto,
  ) {
    return this.library.updateGroup(user.id, id, dto);
  }

  @Delete('groups/:id')
  async deleteGroup(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    await this.library.deleteGroup(user.id, id);
    return { ok: true };
  }

  @Post('documents')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 30 * 1024 * 1024, files: 1 },
    }),
  )
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: UploadedPdf | undefined,
    @Body() dto: UploadPdfDto,
  ) {
    return this.library.upload(user.id, file, dto);
  }

  @Patch('documents/:id')
  updateDocument(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePdfDocumentDto,
  ) {
    return this.library.updateDocument(user.id, id, dto);
  }

  @Get('documents/:id/file')
  async file(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.library.getFile(user.id, id);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(result.document.originalName)}`,
      'Content-Length': String(result.document.sizeBytes),
      'Cache-Control': 'private, max-age=3600',
    });
    return new StreamableFile(createReadStream(result.path));
  }

  @Delete('documents/:id')
  async deleteDocument(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    await this.library.deleteDocument(user.id, id);
    return { ok: true };
  }
}
