import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from '../../../auth/auth.service';
import { AuthDto } from '../../../auth/dto';
import { Tokens } from '../../types';

describe('AuthService Int', () => {
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
    await prisma.cleanDb();
  });

  const dto: AuthDto = { email: 'waqas@test.com', password: '12121212' };

  describe('signUp()', () => {
    it('should create user', async () => {
      const tokens = await authService.signup(dto);

      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it('should throw on duplicate email', async () => {
      let tokens: Tokens | undefined;
      try {
        await authService.signup(dto);
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('signIn()', () => {
    it('should throw if no existing user', async () => {
      let tokens: Tokens | undefined;
      try {
        tokens = await authService.signin({
          email: 'test@temp.com',
          password: 'qwqwq',
        });
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should signin', async () => {
      const tokens = await authService.signin(dto);

      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it('should not signin', async () => {
      let tokens: Tokens | undefined;
      try {
        tokens = await authService.signin({
          email: dto.email,
          password: '1212',
        });
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should pass if call to non existent user', async () => {
      const result = await authService.logout(4);
      expect(result).toBeDefined();
    });

    it('should logout', async () => {
      let userFromDb: User | null;

      userFromDb = await prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });
      expect(userFromDb?.hashedRt).toBeTruthy();

      await authService.logout(userFromDb.id);

      userFromDb = await prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });

      expect(userFromDb?.hashedRt).toBeFalsy();
    });
  });
});
