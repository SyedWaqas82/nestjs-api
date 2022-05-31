import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../../../auth/auth.service';
import { AuthDto } from '../../../auth/dto';
import { EditUserDto } from '../../dto';

describe('UserService Int', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
    await prisma.cleanDb();
  });

  const dto: AuthDto = { email: 'waqas@test.com', password: '12121212' };

  describe('signUp()', () => {
    it('should create user', async () => {
      await authService
        .signup(dto)
        .then((token) => expect(token).toBeDefined());
    });

    it('should throw on duplicate email', async () => {
      try {
        await authService.signup(dto);
      } catch (error) {
        expect(error.status).toBe(403);
      }
    });
  });

  describe('editUser()', () => {
    it('should edit user', async () => {
      let user: User = await prisma.user.findUnique({
        where: { email: dto.email },
      });
      const editDto: EditUserDto = { firstName: 'Syed', lastName: 'Waqas' };
      user = await userService.editUser(user.id, editDto);
      expect(user.firstName).toBe(editDto.firstName);
      expect(user.lastName).toBe(editDto.lastName);
    });
  });
});
