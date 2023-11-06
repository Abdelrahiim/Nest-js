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
import { GetUser } from '../auth/decorators';
import { EditUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { ReturnUser } from '../auth/types';

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

  /**
   * @Route GET /users/me
   * @param user from @UseGuards(JwtGuard)
   */
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  getMe(@GetUser() user: ReturnUser) {
    return user;
  }

  /**
   *
   * @Router GET /me/bookmarks
   * @param userId @UseGuards(JwtGuard)
   */
  @Get('/me/bookmarks')
  async getUserWithBookmarks(@GetUser('id') userId: number) {
    return await this.userService.getUserByIdAndBookmarks(userId);
  }

  /**
   * @Route PATCH /users
   * @param userid
   * @param dto
   */
  @HttpCode(HttpStatus.OK)
  @Patch()
  partialUpdate(@GetUser('id') userid: number, @Body() dto: EditUserDto) {
    return this.userService.updateUser(userid, dto);
  }
}
