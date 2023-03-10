import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty } from '@nestjs/class-validator';

export class TodoRequestDto {
  public id: number;

  @ApiProperty({
    example: '밥 주기',
    description: '투두 리스트 내용',
  })
  @IsNotEmpty()
  public content: string;

  @ApiProperty({
    example: true,
    description: '투두 리스트 done',
  })
  public done: boolean;

  public UserId: number;
}

export class TodoCreateRequestDto extends PickType(TodoRequestDto, [
  'content',
  'UserId',
] as const) {
  public done: boolean;
}

export class TodoUpdateRequestDto extends PickType(TodoRequestDto, [
  'content',
  'id',
  'UserId',
] as const) {}

export class TodoDeleteRequestDto extends PickType(TodoRequestDto, [
  'id',
  'UserId',
] as const) {}

export class TodoDoneRequestDto extends PickType(TodoRequestDto, [
  'id',
  'UserId',
  'done',
] as const) {}
