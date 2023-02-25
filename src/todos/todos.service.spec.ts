import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { Todos } from '../entities/Todos';

class MockTodoRepository {
  #mockData = [
    {
      id: 1,
      content: 'Mock1',
      done: true,
      UserId: 1,
    },
    {
      id: 2,
      content: 'Mock2',
      done: false,
      UserId: 1,
    },
    {
      id: 3,
      content: 'Mock3',
      done: true,
      UserId: 2,
    },
  ];
  findOne(findData: any) {
    const objType = Object.keys(findData.where)[0];
    const objValue = findData.where[`${objType}`];
    const data = this.#mockData.find((v) => v[`${objType}`] === objValue);

    if (data) return data;
    return null;
  }
  find(findData: any) {
    const objType = Object.keys(findData.where)[0];
    const objValue = findData.where[`${objType}`];
    const data = this.#mockData.filter((v) => v[`${objType}`] === objValue);

    if (data) return data;
    return null;
  }
  insert(insertData: any) {
    this.#mockData.push({
      ...insertData,
    });
    return { identifiers: [{ id: insertData['id'] }] };
  }
  update(updateData: any) {
    //
  }
  delete(deleteData: any) {
    //
  }
}

describe('TodosService', () => {
  let service: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todos, 'postgresql'),
          useClass: MockTodoRepository,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('createTodo는 DB에 데이터를 삽입하고 삽입한 데이터의 id를 반환한다.', async () => {
    const id = 4;
    const insertData = { id, content: 'Mock4', UserId: 3 };
    expect(await service.createTodo(insertData)).toBeTruthy();
  });

  it('getTodo는 DB에 존재하는 데이터에서, UserId가 같은 데이터를 반환한다', async () => {
    const UserId = 1;
    expect(await service.getTodo(UserId)).toBeTruthy();
  });

  it('getTodo는 DB에 존재하는 데이터와 Todo List의 UserId와 매칭 되는값이 없다면 "[]" 를 반환한다', async () => {
    const UserId = 428974;
    expect(await service.getTodo(UserId)).toStrictEqual([]);
  });
});
