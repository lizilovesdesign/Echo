import { prisma } from '@/lib/prisma';
import { CreateEchoInput } from '@/lib/validators/echoEntry';

export interface EchoEntryRecord {
  id: string;
  userId: string;
  songTitle: string;
  artist: string;
  albumArtUrl: string;
  spotifyTrackId: string;
  previewUrl: string | null;
  moodTag: string;
  note: string;
  stickers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEchoEntryRepository {
  findByUserId(userId: string): Promise<EchoEntryRecord[]>;
  findById(id: string): Promise<EchoEntryRecord | null>;
  create(userId: string, email: string, input: CreateEchoInput): Promise<EchoEntryRecord>;
  update(id: string, data: Partial<CreateEchoInput>): Promise<EchoEntryRecord>;
  delete(id: string): Promise<void>;
}

class PrismaEchoEntryRepository implements IEchoEntryRepository {
  async findByUserId(userId: string): Promise<EchoEntryRecord[]> {
    return prisma.echoEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<EchoEntryRecord | null> {
    return prisma.echoEntry.findUnique({ where: { id } });
  }

  async create(userId: string, email: string, input: CreateEchoInput): Promise<EchoEntryRecord> {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email },
    });

    return prisma.echoEntry.create({
      data: {
        userId,
        songTitle: input.songTitle,
        artist: input.artist,
        albumArtUrl: input.albumArtUrl,
        spotifyTrackId: input.spotifyTrackId,
        previewUrl: input.previewUrl ?? null,
        moodTag: input.moodTag,
        note: input.note,
        stickers: input.stickers ?? [],
      },
    });
  }

  async update(id: string, data: Partial<CreateEchoInput>): Promise<EchoEntryRecord> {
    return prisma.echoEntry.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.echoEntry.delete({ where: { id } });
  }
}

export const echoEntryRepository: IEchoEntryRepository = new PrismaEchoEntryRepository();
