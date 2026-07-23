import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FlowBoard, FlowEdge, FlowNode } from '../../../domain/flow/flow-board.entity';
import { FlowBoardRepository } from '../../../domain/flow/flow-board.repository';
import { PrismaService } from './prisma.service';

function asNodes(value: Prisma.JsonValue): FlowNode[] {
  if (!Array.isArray(value)) return [];
  return value as FlowNode[];
}

function asEdges(value: Prisma.JsonValue): FlowEdge[] {
  if (!Array.isArray(value)) return [];
  return value as FlowEdge[];
}

@Injectable()
export class FlowBoardPrismaRepository implements FlowBoardRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(row: {
    id: string;
    userId: string;
    subjectId: string;
    name: string;
    nodes: Prisma.JsonValue;
    edges: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }): FlowBoard {
    return FlowBoard.reconstitute({
      id: row.id,
      userId: row.userId,
      subjectId: row.subjectId,
      name: row.name,
      nodes: asNodes(row.nodes),
      edges: asEdges(row.edges),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(board: FlowBoard): Promise<FlowBoard> {
    const row = await this.prisma.flowBoard.upsert({
      where: { id: board.id },
      create: {
        id: board.id,
        userId: board.userId,
        subjectId: board.subjectId,
        name: board.name,
        nodes: board.nodes as Prisma.InputJsonValue,
        edges: board.edges as Prisma.InputJsonValue,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      },
      update: {
        name: board.name,
        nodes: board.nodes as Prisma.InputJsonValue,
        edges: board.edges as Prisma.InputJsonValue,
        updatedAt: board.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  async findByIdForUser(id: string, userId: string): Promise<FlowBoard | null> {
    const row = await this.prisma.flowBoard.findFirst({
      where: { id, userId },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByUser(userId: string): Promise<FlowBoard[]> {
    const rows = await this.prisma.flowBoard.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findBySubjectForUser(
    subjectId: string,
    userId: string,
  ): Promise<FlowBoard[]> {
    const rows = await this.prisma.flowBoard.findMany({
      where: { subjectId, userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.flowBoard.delete({ where: { id } });
  }
}
