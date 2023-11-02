import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async disconnect() {
    await this.$disconnect();
  }

  async cleanDB() {
    return this.$transaction([
      this.bookMark.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
