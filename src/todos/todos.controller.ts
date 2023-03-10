import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import {
  TodoCreateRequestDto,
  TodoDeleteRequestDto,
  TodoDoneRequestDto,
  TodoUpdateRequestDto,
} from './dtos/todo.request.dto';
import { TodosService } from './todos.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GetPayload } from '../common/dacorators/get.payload.decorator';
import { JwtPayload } from '../auth/jwt/jwt.payload.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @ApiOperation({ summary: 'Todo List API' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 에러' })
  @ApiCreatedResponse({ description: 'Todo 작성 성공시' })
  @ApiUnauthorizedResponse({ description: '토큰이 없거나, 유효하지 않을시' })
  @ApiBadRequestResponse({ description: 'content를 보내지 않았을 경우' })
  @ApiBearerAuth('Authorization')
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createTodo(
    @Body() todoCreateRequestDto: TodoCreateRequestDto,
    @GetPayload() payload: JwtPayload,
  ) {
    todoCreateRequestDto.UserId = payload.sub;
    todoCreateRequestDto.done = false;
    return await this.todosService.createTodo(todoCreateRequestDto);
  }

  @ApiOkResponse({ description: 'Todo List 조회에 성공했을 경우' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(200)
  async getTodo(@GetPayload() payload: JwtPayload) {
    const userId = payload.sub;

    return await this.todosService.getTodo(userId);
  }

  @ApiInternalServerErrorResponse({ description: '서버 내부 에러' })
  @ApiBadRequestResponse({ description: 'content를 보내지 않았을 경우' })
  @ApiCreatedResponse({ description: '수정에 성공했을 경우' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Put(':todoId')
  @HttpCode(201)
  async updateTodo(
    @Param('todoId', new ParseIntPipe()) todoId: number,
    @GetPayload() payload: JwtPayload,
    @Body() todoUpdateReqeustDto: TodoUpdateRequestDto,
  ) {
    todoUpdateReqeustDto.UserId = payload.sub;
    todoUpdateReqeustDto.id = todoId;

    return await this.todosService.updateTodo(todoUpdateReqeustDto);
  }

  @ApiNotFoundResponse({
    description: '존재하지 않은 TodoList 에 삭제 요청을 보낼 경우',
  })
  @ApiNoContentResponse({ description: '삭제에 성공했을 경우' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Delete(':todoId')
  @HttpCode(204)
  async deleteTodo(
    @Param('todoId', new ParseIntPipe()) todoId: number,
    @GetPayload() payload: JwtPayload,
  ) {
    const todoDeleteReqeustDto = new TodoDeleteRequestDto();
    todoDeleteReqeustDto.id = todoId;
    todoDeleteReqeustDto.UserId = payload.sub;

    return await this.todosService.deleteTodo(todoDeleteReqeustDto);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Patch(':todoId')
  async doneTodo(
    @Param('todoId', new ParseIntPipe()) todoId: number,
    @GetPayload() payload: JwtPayload,
    @Body() todoDoneRequestDto: TodoDoneRequestDto,
  ) {
    todoDoneRequestDto.id = todoId;
    todoDoneRequestDto.UserId = payload.sub;

    return await this.todosService.doneTodo(todoDoneRequestDto);
  }
}
