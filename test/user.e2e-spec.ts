import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe('User e2e', () => {
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

  describe('Login', () => {
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

  describe('Get me', () => {
    it('should return current user', () => {
      return pactum
        .spec()
        .get('/users/me')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200)
        .expectBodyContains(dto.email);
    });
  });

  describe('Edit user', () => {
    it('should edit user', () => {
      const dto: EditUserDto = { firstName: 'Syed', email: 'syed@test.com' };
      return pactum
        .spec()
        .patch('/users')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.email);
    });
  });
});
