import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, rm, writeFile } from 'fs/promises';
import { extname, resolve } from 'path';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';

export type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

const COVER_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function detectImageMime(buffer: Buffer, claimed: string): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString('ascii').startsWith('GIF8')) {
    return 'image/gif';
  }
  return COVER_MIME[claimed] ? claimed : null;
}

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
    return {
      groups,
      documents: documents.map((doc) => this.toDocumentResponse(doc)),
    };
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
    file: UploadedFile | undefined,
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
      const created = await this.prisma.pdfDocument.create({
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
      return this.toDocumentResponse(created);
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
    const updated = await this.prisma.pdfDocument.update({
      where: { id },
      data: {
        ...input,
        groupId: input.groupId === '' ? null : input.groupId,
      },
    });
    return this.toDocumentResponse(updated);
  }

  async setCover(userId: string, id: string, file: UploadedFile | undefined) {
    if (!file) throw new BadRequestException('Selecione uma imagem de capa.');
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('A capa deve ter no máximo 5 MB.');
    }
    const mime = detectImageMime(file.buffer, file.mimetype);
    if (!mime || !COVER_MIME[mime]) {
      throw new BadRequestException(
        'Use uma imagem JPG, PNG, WEBP ou GIF para a capa.',
      );
    }

    const document = await this.requireDocument(userId, id);
    const coverStorageName = `${randomUUID()}${COVER_MIME[mime]}`;
    await mkdir(this.storageRoot, { recursive: true });
    await writeFile(this.filePath(coverStorageName), file.buffer, {
      flag: 'wx',
    });

    try {
      const updated = await this.prisma.pdfDocument.update({
        where: { id },
        data: { coverStorageName, coverMimeType: mime },
      });
      if (document.coverStorageName) {
        await rm(this.filePath(document.coverStorageName), { force: true });
      }
      return this.toDocumentResponse(updated);
    } catch (error) {
      await rm(this.filePath(coverStorageName), { force: true });
      throw error;
    }
  }

  async removeCover(userId: string, id: string) {
    const document = await this.requireDocument(userId, id);
    if (!document.coverStorageName) {
      return this.toDocumentResponse(document);
    }
    const updated = await this.prisma.pdfDocument.update({
      where: { id },
      data: { coverStorageName: null, coverMimeType: null },
    });
    await rm(this.filePath(document.coverStorageName), { force: true });
    return this.toDocumentResponse(updated);
  }

  async getFile(userId: string, id: string) {
    const document = await this.requireDocument(userId, id);
    return { document, path: this.filePath(document.storageName) };
  }

  async getCover(userId: string, id: string) {
    const document = await this.requireDocument(userId, id);
    if (!document.coverStorageName || !document.coverMimeType) {
      throw new NotFoundException('Este PDF não tem capa.');
    }
    return {
      document,
      path: this.filePath(document.coverStorageName),
      mimeType: document.coverMimeType,
      filename: `cover${extname(document.coverStorageName)}`,
    };
  }

  async deleteDocument(userId: string, id: string) {
    const document = await this.requireDocument(userId, id);
    await this.prisma.pdfDocument.delete({ where: { id } });
    await rm(this.filePath(document.storageName), { force: true });
    if (document.coverStorageName) {
      await rm(this.filePath(document.coverStorageName), { force: true });
    }
  }

  private toDocumentResponse(doc: {
    id: string;
    userId: string;
    groupId: string | null;
    title: string;
    originalName: string;
    storageName: string;
    mimeType: string;
    sizeBytes: number;
    coverStorageName: string | null;
    coverMimeType: string | null;
    favorite: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc.id,
      userId: doc.userId,
      groupId: doc.groupId,
      title: doc.title,
      originalName: doc.originalName,
      storageName: doc.storageName,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      hasCover: Boolean(doc.coverStorageName),
      favorite: doc.favorite,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
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
