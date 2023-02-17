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
    const todo = await this.todosRepository.insert({ ...todoCreateRequestDto });
    return { id: todo.identifiers[0]['id'] };
  }

  async getTodo(userId: number) {
    return await this.todosRepository.find({ where: { UserId: userId } });
  }

  async updateTodo(todoUpdateReqeustDto: TodoUpdateRequestDto) {
    const todo = await this.todosRepository.update(todoUpdateReqeustDto.id, {
      content: todoUpdateReqeustDto.content,
    });
    if (todo.affected === 0)
      throw new BadRequestException('Todo List 가 존재하지 않습니다');

    return;
  }

  async deleteTodo(todoDeleteReqeustDto: TodoDeleteRequestDto) {
    const todo = await this.todosRepository.delete({ ...todoDeleteReqeustDto });

    if (!todo) throw new BadRequestException('Todo List 가 존재하지 않습니다');

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
