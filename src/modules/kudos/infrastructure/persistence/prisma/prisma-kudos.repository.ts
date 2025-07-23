import { PrismaClient } from '@prisma/client';
import { KudosRepository, CreateKudosData } from '../../../domain/kudos.repository';
import { Kudos } from '../../../domain/kudos.entity';
import { UniqueEntityID } from '../../../../../shared/domain/unique-entity-id';

export class PrismaKudosRepository implements KudosRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(kudosData: CreateKudosData): Promise<Kudos> {
    const kudosRecord = await this.prisma.kudos.create({
      data: {
        category: kudosData.category,
        fromUser: kudosData.fromUser,
        toUser: kudosData.toUser,
        message: kudosData.message,
      },
    });

    return Kudos.create(
      {
        category: kudosRecord.category,
        fromUser: kudosRecord.fromUser,
        toUser: kudosRecord.toUser,
        message: kudosRecord.message,
        createdAt: kudosRecord.createdAt,
        updatedAt: kudosRecord.updatedAt,
      },
      new UniqueEntityID(kudosRecord.id)
    );
  }

  async list(): Promise<Kudos[]> {
    const kudosRecords = await this.prisma.kudos.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return kudosRecords.map((record) =>
      Kudos.create(
        {
          category: record.category,
          fromUser: record.fromUser,
          toUser: record.toUser,
          message: record.message,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        },
        new UniqueEntityID(record.id)
      )
    );
  }
}
