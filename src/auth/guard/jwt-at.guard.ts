import { AuthGuard } from '@nestjs/passport';

export class JwtAtGaurd extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
