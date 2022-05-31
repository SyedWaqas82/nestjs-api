import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('Bookmark e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleReaf: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleReaf.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(3333);

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Login', () => {
    const dto: AuthDto = {
      email: 'waqas_sayed@hotmail.com',
      password: 'qwerty123',
    };

    it('should signup', () => {
      return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
    });

    it('should signin', () => {
      return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token');
    });
  });

  describe('Get empty bookmarks', () => {
    it('should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200)
        .expectBody([]);
    });
  });

  describe('Create bookmark', () => {
    const dto: CreateBookmarkDto = {
      title: 'First Bookmark',
      link: 'http://www.google.com',
    };

    it('should create bookmark', () => {
      return pactum
        .spec()
        .post('/bookmarks')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .withBody(dto)
        .stores('bookmarkId', 'id')
        .expectStatus(201);
    });
  });

  describe('Get bookmarks', () => {
    it('should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200)
        .expectJsonLength(1);
    });
  });

  describe('Get bookmark by id', () => {
    it('should get bookmark by id', () => {
      return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}');
    });
  });

  describe('Edit bookmark by id', () => {
    const dto: EditBookmarkDto = {
      title: 'Updated Title',
      description: 'bookmark description',
    };
    it('should edit bookmark', () => {
      return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.description);
    });
  });

  describe('Delete bookmark by id', () => {
    it('should delete bookmark', () => {
      return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(204);
    });

    it('should get empty bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200)
        .expectJsonLength(0);
    });
  });
});
