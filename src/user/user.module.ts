import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '../auth/guard';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
