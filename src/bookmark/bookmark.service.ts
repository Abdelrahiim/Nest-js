import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) {
    await this.confirmOwnership(userId, bookmarkId);
    return this.prisma.bookMark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarksByID(userId: number, bookmarkId: number) {
    await this.confirmOwnership(userId, bookmarkId);
    await this.prisma.bookMark.delete({
      where: {
        id: bookmarkId,
      },
    });
    return { message: `Successfully Delete Bookmark with id ${bookmarkId}` };
  }

  /**
   * Confirms That The User is Owner of the Bookmark
   * @param userId
   * @param bookmarkId
   * @private
   */
  private async confirmOwnership(userId: number, bookmarkId: number) {
    const confirmed = await this.checkOwnership(userId, bookmarkId);
    if (!confirmed) {
      throw new ForbiddenException(
        `You are Not Allow To modify This BookMark `,
      );
    }
  }

  /**
   * check if the User is Owner of the Bookmark Before Editing
   * @param userId
   * @param bookmarkId
   * @private
   */
  private async checkOwnership(userId: number, bookmarkId: number) {
    try {
      const bookmark = await this.prisma.bookMark.findUniqueOrThrow({
        where: {
          id: bookmarkId,
        },
      });
      return bookmark.userId === userId;
    } catch (e) {
      throw new NotFoundException('Object With id ${bookmarkId} Not Found');
    }
  }
}
