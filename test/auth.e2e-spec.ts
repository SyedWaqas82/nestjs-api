import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';

describe('Auth e2e', () => {
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

  const dto: AuthDto = {
    email: 'waqas_sayed@hotmail.com',
    password: 'qwerty123',
  };

  describe('Signup', () => {
    it('should throw if email empty', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody({ password: dto.password })
        .expectStatus(400);
    });

    it('should throw if password empty', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody({ email: dto.email })
        .expectStatus(400);
    });

    it('should throw if no body provided', () => {
      return pactum.spec().post('/auth/signup').expectStatus(400);
    });

    it('should signup', () => {
      return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
    });

    it('should throw if email not unique', () => {
      return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(403);
    });
  });

  describe('Signin', () => {
    it('should throw if email empty', () => {
      return pactum
        .spec()
        .post('/auth/signin')
        .withBody({ password: dto.password })
        .expectStatus(400);
    });

    it('should throw if password empty', () => {
      return pactum
        .spec()
        .post('/auth/signin')
        .withBody({ email: dto.email })
        .expectStatus(400);
    });

    it('should throw if no body provided', () => {
      return pactum.spec().post('/auth/signin').expectStatus(400);
    });

    it('should signin', () => {
      return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token')
        .stores('userRt', 'refresh_token');
    });
  });

  describe('Refresh', () => {
    it('should throw if no body provided', () => {
      return pactum.spec().post('/auth/refresh').expectStatus(401);
    });

    it('should throw with invalid refresh token', () => {
      return pactum
        .spec()
        .post('/auth/refresh')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(401);
    });

    it('should refresh token', () => {
      return pactum
        .spec()
        .post('/auth/refresh')
        .withHeaders({ Authorization: 'Bearer $S{userRt}' })
        .expectStatus(200);
    });
  });

  describe('Logout', () => {
    it('should throw if no body provided', () => {
      return pactum.spec().post('/auth/logout').expectStatus(401);
    });

    it('should logout', () => {
      return pactum
        .spec()
        .post('/auth/logout')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200);
    });
  });
});
