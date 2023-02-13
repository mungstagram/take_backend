import { UsersService } from './../users/users.service';
import { Comments } from '../entities/Comments';
import { CommentsService } from './comments.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../entities/Users';

class MockUserRepository {
  mockData = [
    {
      id: 1,
      email: 'mock@email.com',
      password: 'q1w2e3r4',
      name: '신중완',
      provider: 'local',
      nickname: 'mock',
      profile_image: 'http://mockimage.com',
    },
  ];
  findOne(findData) {
    const objType = Object.keys(findData.where)[0];
    const objValue = findData.where[`${objType}`];
    const data = this.mockData.find((v) => v[`${objType}`] === objValue);

    if (data) return data;
    return null;
  }
  insert({ email, name, nickname, password, provider, profile_image }) {
    this.mockData.push({
      id: 2,
      email: email,
      name: name,
      nickname: nickname,
      password: password,
      provider: provider,
      profile_image: profile_image,
    });
  }
}
class MockCommentRepository {
  mockData = [
    {
      id: 1,
      UserId: 1,
      PostId: 1,
      target: 0,
      comment: 'Mock1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    },
  ];
  findOne(findData) {
    const objType = Object.keys(findData.where)[0];
    const objValue = findData.where[`${objType}`];
    const data = this.mockData.find((v) => v[`${objType}`] === objValue);

    if (data) return data;
    return null;
  }

  insert({ UserId, PostId, target, comment }) {
    this.mockData.push({
      id: 2,
      UserId,
      PostId,
      target,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    });
  }
  createQueryBuilder() {
    select: jest.fn();
  }
}

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        UsersService,
        {
          provide: getRepositoryToken(Comments),
          useClass: MockCommentRepository,
        },
        {
          provide: getRepositoryToken(Users),
          useClass: MockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('createComment', async () => {
    const commentData = {
      comment: 'MockComment',
      target: 0,
      UserId: 1,
      PostId: 1,
    };
    const comment = await service.createComment(commentData);
    expect(comment.comment).toStrictEqual(commentData.comment);
  });
});
