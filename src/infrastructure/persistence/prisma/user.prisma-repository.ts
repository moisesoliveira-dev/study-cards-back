import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/user/user.entity';
import { UserRepository } from '../../../domain/user/user.repository';
import { PrismaService } from './prisma.service';
import { UserMapper } from './mappers/prisma.mappers';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    const row = await this.prisma.user.upsert({
      where: { id: data.id },
      create: data,
      update: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        name: data.name,
        avatarPath: data.avatarPath,
        updatedAt: data.updatedAt,
      },
    });
    return UserMapper.toDomain(row);
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });
    return row ? UserMapper.toDomain(row) : null;
  }
}
