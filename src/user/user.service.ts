import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Access database Threw Prisma and Return All User Data
   * @returns users
   */
  async listAllUsers() {
    try {
      const users: User[] = await this.prisma.user.findMany({});
      return users;
    } catch (e) {
      throw new NotFoundException();
    }
  }

  /**
   * Update User With Threw Prisma
   * @param userId
   * @param dto
   */
  async updateUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });
    delete user.password;
    return user;
  }

  /**
   * Get User With it all Bookmarks from prisma
   * @param userId
   */
  async getUserByIdAndBookmarks(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookmarks: {
          select: {
            title: true,
            link: true,
            description: true,
          },
        },
      },
    });
  }
}
