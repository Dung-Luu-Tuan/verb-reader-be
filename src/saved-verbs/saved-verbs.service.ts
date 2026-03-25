import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveVerbDto } from './save-verb.dto';

@Injectable()
export class SavedVerbsService {
  constructor(private prisma: PrismaService) { }

  async save(userId: number, dto: SaveVerbDto) {
    const existing = await this.prisma.savedVerb.findUnique({
      where: { userId_verb: { userId, verb: dto.verb } },
    });
    if (existing) throw new ConflictException('Verb already saved');

    return this.prisma.savedVerb.create({
      data: {
        userId,
        verb: dto.verb,
        phonetic: dto.phonetic,
        meaning: dto.meaning,
        exampleEn: dto.exampleEn,
        exampleVi: dto.exampleVi,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.savedVerb.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: number, verb: string) {
    await this.prisma.savedVerb.deleteMany({
      where: { userId, verb },
    });
    return { message: 'Verb removed successfully' };
  }
}
