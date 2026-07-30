import { Injectable } from '@nestjs/common';
import { CatalogColor } from '../../../domain/color/catalog-color.entity';
import { CatalogColorRepository } from '../../../domain/color/catalog-color.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class CatalogColorPrismaRepository implements CatalogColorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CatalogColor[]> {
    const rows = await this.prisma.color.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => CatalogColor.reconstitute(row));
  }

  async findById(id: string): Promise<CatalogColor | null> {
    const row = await this.prisma.color.findUnique({ where: { id } });
    return row ? CatalogColor.reconstitute(row) : null;
  }

  async findByHex(hex: string): Promise<CatalogColor | null> {
    const row = await this.prisma.color.findUnique({ where: { hex } });
    return row ? CatalogColor.reconstitute(row) : null;
  }

  async save(color: CatalogColor): Promise<CatalogColor> {
    const row = await this.prisma.color.upsert({
      where: { id: color.id },
      create: {
        id: color.id,
        name: color.name,
        hex: color.hex,
        description: color.description,
        position: color.position,
        createdAt: color.createdAt,
        updatedAt: color.updatedAt,
      },
      update: {
        name: color.name,
        hex: color.hex,
        description: color.description,
        position: color.position,
        updatedAt: color.updatedAt,
      },
    });
    return CatalogColor.reconstitute(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.color.delete({ where: { id } });
  }
}
