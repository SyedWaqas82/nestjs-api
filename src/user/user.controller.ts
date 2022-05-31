import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetCurrentUser, GetCurrentUserId } from '../auth/decorator';
import { JwtAtGaurd } from '../auth/guard';
import { JwtPayload } from '../auth/types';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAtGaurd)
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetCurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }

  @Patch()
  editUser(
    @GetCurrentUserId() userId: number,
    @Body() dto: EditUserDto,
  ): Promise<User> {
    return this.userService.editUser(userId, dto);
  }
}
