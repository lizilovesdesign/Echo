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
  entryType: string;
  albumName: string | null;
  spotifyAlbumId: string | null;
  moodTag: string;
  note: string;
  stickers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEchoEntryRepository {
  findByUserId(userId: string, limit?: number): Promise<EchoEntryRecord[]>;
  findById(id: string): Promise<EchoEntryRecord | null>;
  create(userId: string, email: string, input: CreateEchoInput): Promise<EchoEntryRecord>;
  update(id: string, data: Partial<CreateEchoInput>): Promise<EchoEntryRecord>;
  delete(id: string): Promise<void>;
}

class PrismaEchoEntryRepository implements IEchoEntryRepository {
  async findByUserId(userId: string, limit?: number): Promise<EchoEntryRecord[]> {
    return prisma.echoEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });
  }

  async findById(id: string): Promise<EchoEntryRecord | null> {
    return prisma.echoEntry.findUnique({ where: { id } });
  }

  async create(userId: string, email: string, input: CreateEchoInput): Promise<EchoEntryRecord> {
    const existing = await prisma.user.findUnique({ where: { id: userId } });

    if (!existing) {
      const existingByEmail = await prisma.user.findUnique({ where: { email } });

      if (existingByEmail && existingByEmail.id !== userId) {
        const oldId = existingByEmail.id;
        await prisma.$transaction([
          // 1. Rename old user's email to free the unique constraint
          prisma.user.update({
            where: { id: oldId },
            data: { email: `${email}_old_${oldId}` },
          }),
          // 2. Create the new user with target ID and original email
          prisma.user.create({
            data: { id: userId, email },
          }),
          // 3. Move all echo entries from old ID to new ID
          prisma.echoEntry.updateMany({
            where: { userId: oldId },
            data: { userId },
          }),
          // 4. Delete the old user
          prisma.user.delete({
            where: { id: oldId },
          }),
        ]);
      } else {
        await prisma.user.create({ data: { id: userId, email } });
      }
    }

    return prisma.echoEntry.create({
      data: {
        userId,
        songTitle: input.songTitle,
        artist: input.artist,
        albumArtUrl: input.albumArtUrl,
        spotifyTrackId: input.spotifyTrackId,
        previewUrl: input.previewUrl ?? null,
        entryType: input.entryType ?? 'song',
        albumName: input.albumName ?? null,
        spotifyAlbumId: input.spotifyAlbumId ?? null,
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
