import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { access, mkdir, rm, writeFile } from 'fs/promises';
import { constants } from 'fs';
import { resolve } from 'path';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';

export type UploadedPdf = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class PdfLibraryService {
  private readonly storageRoot: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.storageRoot = resolve(
      config.get<string>('PDF_STORAGE_PATH') ?? 'storage/pdfs',
    );
  }

  async list(userId: string) {
    const [groups, documents] = await Promise.all([
      this.prisma.pdfGroup.findMany({
        where: { userId },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.pdfDocument.findMany({
        where: { userId },
        orderBy: [{ favorite: 'desc' }, { updatedAt: 'desc' }],
      }),
    ]);
    return { groups, documents };
  }

  async createGroup(
    userId: string,
    input: { name: string; description?: string; color?: string },
  ) {
    const position = await this.prisma.pdfGroup.count({ where: { userId } });
    return this.prisma.pdfGroup.create({
      data: { userId, position, ...input },
    });
  }

  async updateGroup(
    userId: string,
    id: string,
    input: { name?: string; description?: string; color?: string },
  ) {
    await this.requireGroup(userId, id);
    return this.prisma.pdfGroup.update({ where: { id }, data: input });
  }

  async deleteGroup(userId: string, id: string) {
    await this.requireGroup(userId, id);
    await this.prisma.pdfGroup.delete({ where: { id } });
  }

  async upload(
    userId: string,
    file: UploadedPdf | undefined,
    input: { title?: string; groupId?: string },
  ) {
    if (!file) throw new BadRequestException('Selecione um arquivo PDF.');
    if (
      file.mimetype !== 'application/pdf' ||
      file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-'
    ) {
      throw new BadRequestException('O arquivo enviado não é um PDF válido.');
    }
    if (input.groupId) await this.requireGroup(userId, input.groupId);

    const storageName = `${randomUUID()}.pdf`;
    await mkdir(this.storageRoot, { recursive: true });
    await writeFile(this.filePath(storageName), file.buffer, { flag: 'wx' });

    const fallbackTitle = file.originalname.replace(/\.pdf$/i, '').trim();
    try {
      return await this.prisma.pdfDocument.create({
        data: {
          userId,
          groupId: input.groupId || null,
          title: input.title?.trim() || fallbackTitle || 'Documento PDF',
          originalName: file.originalname,
          storageName,
          mimeType: 'application/pdf',
          sizeBytes: file.size,
        },
      });
    } catch (error) {
      await rm(this.filePath(storageName), { force: true });
      throw error;
    }
  }

  async updateDocument(
    userId: string,
    id: string,
    input: { title?: string; groupId?: string | null; favorite?: boolean },
  ) {
    await this.requireDocument(userId, id);
    if (input.groupId) await this.requireGroup(userId, input.groupId);
    return this.prisma.pdfDocument.update({
      where: { id },
      data: {
        ...input,
        groupId: input.groupId === '' ? null : input.groupId,
      },
    });
  }

  async getFile(userId: string, id: string) {
    const document = await this.requireDocument(userId, id);
    const path = this.filePath(document.storageName);
    try {
      await access(path, constants.R_OK);
    } catch {
      throw new NotFoundException(
        'Arquivo do PDF não está mais no servidor (sumiu após um redeploy sem volume). Exclua o item e envie o PDF de novo.',
      );
    }
    return { document, path };
  }

  async deleteDocument(userId: string, id: string) {
    const document = await this.requireDocument(userId, id);
    await this.prisma.pdfDocument.delete({ where: { id } });
    await rm(this.filePath(document.storageName), { force: true });
  }

  private async requireGroup(userId: string, id: string) {
    const group = await this.prisma.pdfGroup.findFirst({
      where: { id, userId },
    });
    if (!group) throw new NotFoundException('Grupo de PDFs não encontrado.');
    return group;
  }

  private async requireDocument(userId: string, id: string) {
    const document = await this.prisma.pdfDocument.findFirst({
      where: { id, userId },
    });
    if (!document) throw new NotFoundException('PDF não encontrado.');
    return document;
  }

  private filePath(storageName: string) {
    return resolve(this.storageRoot, storageName);
  }
}
