import { SingupRequestDto } from './../../users/dtos/signup.request.dto';
import { PickType } from '@nestjs/swagger';

export class LoginRequestDto extends PickType(SingupRequestDto, [
  'email',
  'password',
] as const) {}
