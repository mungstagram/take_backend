import { SignupReqeustDto } from './../../users/dtos/signup.request.dto';
import { PickType } from '@nestjs/swagger';

export class LoginRequestDto extends PickType(SignupReqeustDto, [
  'email',
  'password',
] as const) {}
