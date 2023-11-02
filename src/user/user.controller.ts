import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { JwtGuard } from '../auth/guard';
import { GetUser, ReturnUser } from '../auth/decorators';
import { EditUserDto } from './dto';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  /**
   *  GET /users/
   */
  @Get('/')
  list() {
    return this.userService.listAllUsers();
  }
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  getMe(@GetUser() user: ReturnUser) {
    return user;
  }
  @Get('/me/bookmarks')
  async getUserWithBookmarks(@GetUser('id') userId: number) {
    return await this.userService.getUserByIdAndBookmarks(userId);
  }
  @HttpCode(HttpStatus.OK)
  @Patch()
  partialUpdate(@GetUser('id') userid: number, @Body() dto: EditUserDto) {
    return this.userService.updateUser(userid, dto);
  }
}
