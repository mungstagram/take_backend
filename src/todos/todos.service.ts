import {
  TodoCreateRequestDto,
  TodoDeleteRequestDto,
  TodoDoneRequestDto,
  TodoUpdateRequestDto,
} from './dtos/todo.request.dto';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todos } from '../entities/Todos';
import { Repository } from 'typeorm';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todos)
    private readonly todosRepository: Repository<Todos>,
  ) {}

  async createTodo(todoCreateRequestDto: TodoCreateRequestDto) {
    await this.todosRepository.insert({ ...todoCreateRequestDto });

    const todo = await this.todosRepository.findOne({
      where: { ...todoCreateRequestDto },
    });

    if (!todo)
      throw new InternalServerErrorException(
        'Todo List 작성에 실패 하였습니다.',
      );

    return { id: todo.id };
  }

  async getTodo(userId: number) {
    return await this.todosRepository.find({ where: { UserId: userId } });
  }

  async updateTodo(todoUpdateReqeustDto: TodoUpdateRequestDto) {
    const todo = await this.todosRepository.findOne({
      where: { id: todoUpdateReqeustDto.id },
    });

    if (!todo) throw new BadRequestException('Todo List 가 존재하지 않습니다');

    await this.todosRepository.update(todoUpdateReqeustDto.id, {
      content: todoUpdateReqeustDto.content,
    });

    return;
  }

  async deleteTodo(todoDeleteReqeustDto: TodoDeleteRequestDto) {
    const todo = await this.todosRepository.delete({ ...todoDeleteReqeustDto });

    if (todo.affected === 0)
      throw new NotFoundException('존재하지 않은 Todo List 입니다.');

    return todo;
  }

  async doneTodo(todoDoneRequestDto: TodoDoneRequestDto) {
    const { done, id, UserId } = todoDoneRequestDto;

    const todo = await this.todosRepository.findOne({ where: { id, UserId } });

    if (!todo) throw new NotFoundException('존재하지 않은 Todo List 입니다.');

    if (todo.done === done)
      throw new BadRequestException(`이미 Todo List의 done이 ${done} 입니다`);

    await this.todosRepository.update(todo.id, { done: !todo.done });

    return;
  }
}
