import { SignupReqeustDto } from './dtos/signup.request.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { UsersService } from './users.service';
import { ConflictException } from '@nestjs/common';

// * Mocking
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

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users, 'postgresql'),
          useClass: MockUserRepository,
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
      provider: 'local',
      profile_image: 'http://mockimage.com',
    });
  });
  it('findById 함수는 존재하지 않는 Id를 조회 할 경우 null을 반환', () => {
    expect(service.findById(100)).resolves.toStrictEqual(null);
  });

  it('findByEmail 함수는 Email이 일치하는 데이터를 받아옴', () => {
    expect(service.findByEmail('mock@email.com')).resolves.toStrictEqual({
      id: 1,
      email: 'mock@email.com',
      password: 'q1w2e3r4',
      name: '신중완',
      nickname: 'mock',
      provider: 'local',
      profile_image: 'http://mockimage.com',
    });
  });

  // * Signup Testing

  it('회원가입시 이메일이 중복일경우 Conflict Exception 을 던짐', async () => {
    const requestDto: SignupReqeustDto = {
      email: 'mock@email.com',
      password: 'q1w2e3r4',
      name: 'Jset',
      nickname: '중복 아닌 닉네임',
      provider: 'local',
      profile_image: 'mock profile',
    };
    try {
      await service.signup(requestDto);
    } catch (err) {
      expect(err).toBeInstanceOf(ConflictException);
    }
  });

  it('회원가입시 닉네임이 중복일경우 Conflict Exception 을 던짐', async () => {
    const requestDto: SignupReqeustDto = {
      email: '중복아닌 이메일',
      password: 'q1w2e3r4',
      name: 'Jset',
      nickname: 'mock',
      provider: 'local',
      profile_image: 'mock profile',
    };
    try {
      await service.signup(requestDto);
    } catch (err) {
      expect(err).toBeInstanceOf(ConflictException);
    }
  });

  it('회원가입시 중복이 없을경우 data가 insert 되고 공백을 반환함', async () => {
    const requestDto: SignupReqeustDto = {
      email: '중복아닌 이메일',
      password: 'q1w2e3r4',
      name: 'Jset',
      nickname: '중복 아닌 닉네임',
      provider: 'local',
      profile_image: 'mock profile',
    };

    // * 회원가입이 성공하면 Created를 반환함.
    expect(await service.signup(requestDto)).toBe('Created');
    // * 회원가입이 성공하면 요청한 정보가 저장됨
    expect(await service.findByEmail(requestDto.email)).toBeDefined;
  });
});
