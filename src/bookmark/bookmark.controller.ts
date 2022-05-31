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
import { Bookmark } from '@prisma/client';
import { GetCurrentUserId } from '../auth/decorator';
import { JwtAtGaurd } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Controller('bookmarks')
@UseGuards(JwtAtGaurd)
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  getBookmarks(@GetCurrentUserId() userId: number): Promise<Bookmark[]> {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetCurrentUserId() userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ): Promise<Bookmark> {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  createBookmark(
    @GetCurrentUserId() userId: number,
    @Body() dto: CreateBookmarkDto,
  ): Promise<Bookmark> {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Patch(':id')
  editBookmarkById(
    @GetCurrentUserId() userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ): Promise<Bookmark> {
    return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetCurrentUserId() userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ): Promise<void> {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
