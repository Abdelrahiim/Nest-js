import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, dto: BookmarkDto) {
    return this.prisma.bookMark.create({
      data: {
        title: dto.title,
        link: dto.link,
        description: dto.description,
        userId: userId,
      },
    });
  }

  async getBookmarks(userId: number) {
    return this.prisma.bookMark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarksByID(userId: number, bookmarkId: number) {
    try {
      return await this.prisma.bookMark.findUniqueOrThrow({
        where: {
          id: bookmarkId,
        },
      });
    } catch (e) {
      throw new NotFoundException(`Object With id ${bookmarkId} Not Found `);
    }
  }

  async updateBookmarksByID(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {}

  async deleteBookmarksByID(userId: number, bookmarkId: number) {}
}
