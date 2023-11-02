import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorators';
import { BookmarkDto } from './dto';
import { EditBookmarkDto } from './dto';

/**
 * BookMark Controller
 * Protected
 * @route bookmark
 */
@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  list(@GetUser('id') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }
  @Get(':id')
  retrieve(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarksByID(userId, bookmarkId);
  }
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@GetUser('id') userId: number, @Body() dto: BookmarkDto) {
    return this.bookmarkService.createBookmark(userId, dto);
  }
  @Patch(':id')
  partialUpdate(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmarksByID(userId, bookmarkId, dto);
  }

  @Delete(':id')
  destroy(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.deleteBookmarksByID(userId, bookmarkId);
  }
}
