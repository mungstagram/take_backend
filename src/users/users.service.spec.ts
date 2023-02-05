import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Users } from '../entities/Users';
import { UsersService } from './users.service';

// * Mocking
class MockUserRepository {
  #data = [
    {
      id: 1,
      email: 'mock@email.com',
      password: 'q1w2e3r4',
      name: '신중완',
      nickname: 'mock',
      profile_image: 'http://mockimage.com',
    },
  ];
  findOne({ where: { id } }) {
    const data = this.#data.find((v) => v.id === id);
    if (data) {
      return data;
    }
    return null;
  }
}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useClass: MockUserRepository,
        },
        {
          provide: DataSource,
          useClass: class MockDataSource {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('findById 함수는 id가 일치하는 데이터를 전부 받아옴  ', () => {
    expect(service.findById(1)).resolves.toStrictEqual({
      id: 1,
      email: 'mock@email.com',
      password: 'q1w2e3r4',
      name: '신중완',
      nickname: 'mock',
      profile_image: 'http://mockimage.com',
    });
  });
  it('findById 함수는 존재하지 않는 Id를 조회 할 경우 null을 받아옴', () => {
    expect(service.findById(100)).resolves.toStrictEqual(null);
  });
});
