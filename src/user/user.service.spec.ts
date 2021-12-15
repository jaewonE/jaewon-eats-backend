import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/auth/jwt/jwt.service';
import { Repository } from 'typeorm';
import { userErrors } from './errors/user.error';
import { User, UserRole } from './entities/user.entity';
import { UserService } from './user.service';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'token_sample'),
  verify: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository;
  let jwtService: JwtService;

  const createUserArgs = {
    name: 'jaewone',
    age: 22,
    email: 'test@email.com',
    password: '12345',
    gender: 0,
    role: UserRole.Owner,
  };

  const findUserArgs = {
    id: 1,
    email: 'test@email.com',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('Should fail if user exists', async () => {
      userRepository.findOne.mockResolvedValue(createUserArgs);
      const result = await service.createUser(createUserArgs);
      expect(result).toMatchObject(userErrors.userExists('test@email.com'));
    });

    it('Should create user', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(createUserArgs);
      userRepository.save.mockResolvedValue(createUserArgs);

      const result = await service.createUser(createUserArgs);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createUserArgs);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createUserArgs);

      expect(result).toMatchObject({ sucess: true });
    });

    it('Should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createUser(createUserArgs);
      expect(result).toMatchObject(userErrors.unexpectedError('createUser'));
    });
  });
  describe('findUser', () => {
    it('Should fail if user does not exists', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.findUser(findUserArgs);
      expect(result).toMatchObject(userErrors.userNotFound);
    });

    it('Should find user if the user exists', async () => {
      userRepository.findOne.mockResolvedValue(createUserArgs);
      const result = await service.findUser(findUserArgs);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(findUserArgs);

      expect(result).toMatchObject({ sucess: true, user: createUserArgs });
    });

    it('Should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.findUser(createUserArgs);
      expect(result).toMatchObject(userErrors.unexpectedError('findUser'));
    });
  });

  describe('updateUser', () => {
    const updatedUserObject = {
      ...createUserArgs,
      email: 'change@email.com',
      name: 'test_name',
      emailVarifed: false,
    };
    it('Should fail if user does not exists', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.updateUser(findUserArgs, {
        email: 'change@email.com',
      });
      expect(result).toMatchObject(userErrors.userNotFound);
    });
    it('Should update user object', async () => {
      userRepository.findOne.mockResolvedValue(createUserArgs);
      userRepository.create.mockReturnValue(updatedUserObject);
      userRepository.save.mockResolvedValue(updatedUserObject);

      //여기 함수를 기점으로 createUserArgs의 내용물이 updateUserObject와 합쳐진 내용으로 변경된다.
      //함수를 수행하며 findOne의 mockResolvedValue의 값을 수정하기 때문이다.
      //그렇기에 이 함수 이후로 사용되는 createUserArgs의 email은 change@email.com 이고, name은 test_name인 것이다.
      const { sucess, user } = await service.updateUser(findUserArgs, {
        email: 'change@email.com',
        name: 'test_name',
      });

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(updatedUserObject);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(updatedUserObject);

      expect(sucess).toEqual(true);
      expect(user.email).toEqual('change@email.com');
      expect(user.name).toEqual('test_name');
    });

    it('Should fail on exception while saving user object', async () => {
      userRepository.findOne.mockReturnValue(createUserArgs);
      userRepository.save.mockRejectedValue(new Error());
      const result = await service.updateUser(findUserArgs, updatedUserObject);
      expect(result).toMatchObject(
        userErrors.unexpectedError('updateUser while saving user infomation'),
      );
    });

    it('Should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.updateUser(findUserArgs, updatedUserObject);
      expect(result).toMatchObject(userErrors.unexpectedError('updateUser'));
    });
  });

  describe('deleteUser', () => {
    it('Should fail if user does not exists', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.deleteUser(findUserArgs);
      expect(result).toMatchObject(userErrors.userNotFound);
    });

    it('Should delete user object', async () => {
      userRepository.findOne.mockResolvedValue(findUserArgs);
      userRepository.delete.mockResolvedValue(null);
      const result = await service.deleteUser(findUserArgs);
      expect(result).toMatchObject({ sucess: true });
    });

    it('Should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.deleteUser(findUserArgs);
      expect(result).toMatchObject(userErrors.unexpectedError('deleteUser'));
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@email.com',
      password: 'testPassword',
    };
    it('Should fail if user does not exists', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(result).toMatchObject(userErrors.userNotFound);
    });

    it('Should sucessfully login', async () => {
      userRepository.findOne.mockResolvedValue({
        password: 'testPassword',
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      });
      const { sucess, token } = await service.login(loginArgs);
      expect(jwtService.sign).toBeCalledTimes(1);
      expect(jwtService.sign).toBeCalledWith('1');
      expect(sucess).toEqual(true);
      expect(token).toEqual('token_sample');
    });

    it('Should fail if input password was wrong.', async () => {
      userRepository.findOne.mockResolvedValue({
        password: 'testPassword',
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      });
      const result = await service.login({
        email: 'test@email.com',
        password: 'WrongPassword',
      });
      expect(result).toMatchObject(userErrors.wrongPassword);
    });

    it('Should fail on expection', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toMatchObject(userErrors.unexpectedError('login'));
    });
  });
});
