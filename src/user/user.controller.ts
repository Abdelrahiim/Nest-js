import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';
import { GetUser, ReturnUser } from '../auth/decorators';
import { EditUserDto } from './dto';
import { th } from '@faker-js/faker';

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
  @HttpCode(HttpStatus.OK)
  @Patch()
  partialUpdate(@GetUser('id') userid: number, @Body() dto: EditUserDto) {
    return this.userService.updateUser(userid, dto);
  }
}
