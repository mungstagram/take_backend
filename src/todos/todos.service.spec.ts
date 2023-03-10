import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TodoCreateRequestDto,
  TodoDeleteRequestDto,
  TodoDoneRequestDto,
  TodoUpdateRequestDto,
} from './dtos/todo.request.dto';
import { Todos } from '../entities/Todos';
import { TodosService } from './todos.service';
import { BadRequestException } from '@nestjs/common';

describe('TodosService', () => {
  let todosService: TodosService;
  let todosRepository: Repository<Todos>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todos, 'postgresql'),
          useClass: Repository,
        },
      ],
    }).compile();

    todosService = moduleRef.get<TodosService>(TodosService);
    todosRepository = moduleRef.get<Repository<Todos>>(
      getRepositoryToken(Todos, 'postgresql'),
    );
  });

  describe('createTodo', () => {
    it('should create a new todo and return it', async () => {
      const mockTodo = new Todos();
      mockTodo.id = 1;
      mockTodo.content = 'Test Todo';
      mockTodo.UserId = 1;

      const insertTodo = {
        identifiers: [{ id: mockTodo.id }],
        generatedMaps: [{ a: 'b' }],
        raw: 'any',
      };

      jest.spyOn(todosRepository, 'insert').mockResolvedValueOnce(insertTodo);
      jest.spyOn(todosRepository, 'findOne').mockResolvedValueOnce(mockTodo);

      const createdTodo = await todosService.createTodo(mockTodo);

      expect(todosRepository.insert).toHaveBeenCalledWith(mockTodo);
      expect(todosRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
      });
      expect(createdTodo).toEqual(mockTodo);
    });
  });

  describe('getTodo', () => {
    it('should return an array of todos for a given user id', async () => {
      const mockTodos: Todos[] = [];
      [
        { id: 1, content: 'Test Todo 1', UserId: 1 },
        { id: 2, content: 'Test Todo 2', UserId: 1 },
      ].forEach((v) => {
        const mockTodo = new Todos();
        mockTodo.id = v.id;
        mockTodo.content = v.content;
        mockTodo.UserId = v.UserId;

        mockTodos.push(mockTodo);
      });
      jest.spyOn(todosRepository, 'find').mockResolvedValueOnce(mockTodos);

      const todos = await todosService.getTodo(1);

      expect(todosRepository.find).toHaveBeenCalledWith({
        where: { UserId: 1 },
      });
      expect(todos).toEqual(mockTodos);
    });
  });

  describe('updateTodo', () => {
    it('should update the content of an existing todo and return it', async () => {
      const mockTodo = new Todos();
      mockTodo.id = 1;
      mockTodo.content = 'Test Todo';
      mockTodo.UserId = 1;

      jest.spyOn(todosRepository, 'update').mockResolvedValueOnce({
        affected: 1,
        generatedMaps: [{ a: 'b' }],
        raw: 'any',
      });
      jest.spyOn(todosRepository, 'findOne').mockResolvedValueOnce(mockTodo);

      const updatedTodo = await todosService.updateTodo({
        id: 1,
        content: 'Updated Todo',
        UserId: 1,
      });

      console.log(mockTodo);

      console.log(updatedTodo);

      expect(todosRepository.update).toHaveBeenCalledWith(1, {
        content: 'Updated Todo',
      });
      expect(todosRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      // expect(updatedTodo).toEqual({
      //   id: 1,
      //   content: 'Updated Todo',
      //   UserId: 1,
      // });
    });

    it('should throw a BadRequestException when trying to update a non-existing todo', async () => {
      jest.spyOn(todosRepository, 'update').mockResolvedValueOnce({
        affected: 0,
        generatedMaps: [{ a: 'b' }],
        raw: 'any',
      });

      await expect(
        todosService.updateTodo({
          id: 1,
          content: 'Updated Todo',
          UserId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
