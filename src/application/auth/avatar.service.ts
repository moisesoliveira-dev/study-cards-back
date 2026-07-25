import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname, resolve } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import type { UserRepository } from '../../domain/user/user.repository';
import { DomainError } from '../../domain/shared/domain.error';
import { toAuthUserView } from './auth-types';

export type UploadedAvatar = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 2 * 1024 * 1024;

export class AvatarService {
  private readonly storageRoot: string;

  constructor(
    private readonly users: UserRepository,
    config: ConfigService,
  ) {
    this.storageRoot = resolve(
      config.get<string>('AVATAR_STORAGE_PATH') ?? 'storage/avatars',
    );
  }

  async upload(userId: string, file: UploadedAvatar | undefined) {
    if (!file) {
      throw new BadRequestException('Selecione uma imagem.');
    }
    if (!ALLOWED.has(file.mimetype)) {
      throw new BadRequestException(
        'Use uma imagem JPG, PNG ou WebP (máx. 2 MB).',
      );
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('A imagem deve ter no máximo 2 MB.');
    }

    const user = await this.users.findById(userId);
    if (!user) {
      throw new DomainError('USER_NOT_FOUND', 'Usuário não encontrado');
    }

    await mkdir(this.storageRoot, { recursive: true });
    if (user.avatarPath) {
      await rm(resolve(this.storageRoot, user.avatarPath), {
        force: true,
      }).catch(() => undefined);
    }

    const ext =
      file.mimetype === 'image/png'
        ? '.png'
        : file.mimetype === 'image/webp'
          ? '.webp'
          : '.jpg';
    const filename = `${userId}${ext}`;
    await writeFile(resolve(this.storageRoot, filename), file.buffer);
    user.setAvatarPath(filename);
    const saved = await this.users.save(user);
    return toAuthUserView(saved);
  }

  async remove(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new DomainError('USER_NOT_FOUND', 'Usuário não encontrado');
    }
    if (user.avatarPath) {
      await rm(resolve(this.storageRoot, user.avatarPath), {
        force: true,
      }).catch(() => undefined);
      user.setAvatarPath(null);
      const saved = await this.users.save(user);
      return toAuthUserView(saved);
    }
    return toAuthUserView(user);
  }

  async getFile(userId: string): Promise<{
    absolutePath: string;
    contentType: string;
  }> {
    const user = await this.users.findById(userId);
    if (!user?.avatarPath) {
      throw new NotFoundException('Avatar não encontrado');
    }
    const absolutePath = resolve(this.storageRoot, user.avatarPath);
    const ext = extname(user.avatarPath).toLowerCase();
    const contentType =
      ext === '.png'
        ? 'image/png'
        : ext === '.webp'
          ? 'image/webp'
          : 'image/jpeg';
    return { absolutePath, contentType };
  }
}
