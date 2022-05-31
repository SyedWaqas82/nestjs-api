import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from '../../../auth/auth.service';
import { AuthDto } from '../../../auth/dto';
import { BookmarkService } from '../../bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from '../../dto';

describe('Bookmark Int', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let bookmarkService: BookmarkService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
    bookmarkService = moduleRef.get<BookmarkService>(BookmarkService);
    await prisma.cleanDb();
  });

  let userId: number;
  let bookmarkId: number;
  const userDto: AuthDto = { email: 'waqas@test.com', password: '12121212' };
  const dto: CreateBookmarkDto = {
    title: 'bookmark title',
    link: 'http://www.google.com',
    description: 'bookmark description',
  };

  describe('createBookmark()', () => {
    it('should create user', async () => {
      await authService
        .signup(userDto)
        .then((token) => expect(token).toBeDefined());

      const user: User = await prisma.user.findUnique({
        where: { email: userDto.email },
      });

      userId = user.id;
    });

    it('should create bookmark', async () => {
      const bookmark = await bookmarkService.createBookmark(userId, dto);

      bookmarkId = bookmark.id;

      expect(bookmark.title).toBe(dto.title);
      expect(bookmark.link).toBe(dto.link);
      expect(bookmark.description).toBe(dto.description);
    });
  });

  describe('getBookmarks()', () => {
    it('should get bookmarks', async () => {
      const bookmarks = await bookmarkService.getBookmarks(userId);
      expect(bookmarks.length).toBe(1);
    });
  });

  describe('getBookmarkById()', () => {
    it('should get bookmark', async () => {
      const bookmark = await bookmarkService.getBookmarkById(
        userId,
        bookmarkId,
      );

      expect(bookmark.title).toBe(dto.title);
      expect(bookmark.link).toBe(dto.link);
      expect(bookmark.description).toBe(dto.description);
    });
  });

  describe('editBookmarkById()', () => {
    it('should edit bookmark', async () => {
      const editDto: EditBookmarkDto = {
        title: 'Updated Link',
        link: 'http://www.yahoo.com',
        description: 'Updated Description',
      };
      const bookmark = await bookmarkService.editBookmarkById(
        userId,
        bookmarkId,
        editDto,
      );
      expect(bookmark.title).toBe(editDto.title);
      expect(bookmark.link).toBe(editDto.link);
      expect(bookmark.description).toBe(editDto.description);
    });
  });

  describe('deleteBookmarkById()', () => {
    it('should delete bookmark', async () => {
      await bookmarkService.deleteBookmarkById(userId, bookmarkId);
      const bookmark = await bookmarkService.getBookmarkById(
        userId,
        bookmarkId,
      );
      expect(bookmark).toBeNull();
    });
  });
});
