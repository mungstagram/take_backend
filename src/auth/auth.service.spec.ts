import { UsersService } from '././users/users.service';
import { UsersModule } from './../users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tokens } from '../entities/Tokens';
import { Users } from '../entities/Users';
import { AuthService } from './auth.service';

class MockUserRepository {
  mockData = [
    {
      id: 1,
      email: 'mock@email.com',
      password: '$2b$12$mLfu9JtisDeo4g5ENts88.bnx1JwUY6fa7yTOkfdkHfJU61LZ1o.C', // q1w2e3r4
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
}

class MockTokenRepository {
  mockData = [];
  findOne(findData) {
    const objType = Object.keys(findData.where)[0];
    const objValue = findData.where[`${objType}`];
    const data = this.mockData.find((v) => v[`${objType}`] === objValue);

    if (data) return data;
    return null;
  }
  insert({ id, UserId, token }) {
    this.mockData.push({
      id,
      UserId,
      token,
    });
  }
}

// interface JwtSignOptions {
//   secret?: string | Buffer;
//   privateKey?: string | Buffer;
// }

// class MockJwtService {
//   constructor(private readonly jwtService: JwtService) {}
//   signAsync(payload: string | object | Buffer, options?: JwtSignOptions) {
//     return this.jwtService.signAsync(payload, options);
//   }
// }

const loginRequestDto = {
  id: 1,
  email: 'mock@email.com',
  password: 'q1w2e3r4',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'testkey',
          secretOrPrivateKey: 'testkey',
        }),
      ],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Users),
          useClass: MockUserRepository,
        },
        {
          provide: getRepositoryToken(Tokens),
          useClass: MockTokenRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('RequestBody의 email 값이 DB에 존재 하지 않을경우 401 에러 던짐', async () => {
    // * 존재하지 않는 Email 설정.
    loginRequestDto.email = 'notExist@email.com';
    try {
      await service.login(loginRequestDto);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('RequestBody 의 Password와 DB에 존재하는 Password의 검증에 실패 할시 401 에러 던짐', async () => {
    // * 존재하는 Email 설정
    loginRequestDto.email = 'mock@email.com';
    // * 존재하지 않는 Password 설정.
    loginRequestDto.password = 'incorrectPassword';
    try {
      await service.login(loginRequestDto);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('로그인에 성공할시 Tokens 테이블에 UserId, RefreshToken을 삽입함.', async () => {
    loginRequestDto.password = 'q1w2e3r4';

    await service.login(loginRequestDto);
    const token = await service.tokenFindByUserId(loginRequestDto.id);

    expect(token.token).toBeTruthy();
  });

  it('로그인에 성공할시 AccessToken, nickname을 반환함.', async () => {
    const returnData = await service.login(loginRequestDto);
    const token = await service.tokenFindByUserId(loginRequestDto.id);

    expect(returnData).toBeTruthy();
  });
});
