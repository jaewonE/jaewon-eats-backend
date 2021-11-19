import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository;

  const createUserArgs = {
    name: 'jaewone',
    age: 22,
    email: 'test@email.com',
    password: '12345',
    gender: 0,
    role: 0,
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
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('Should fail if user exists', async () => {
      userRepository.findOne.mockResolvedValue(findUserArgs);
      const result = await service.createUser(createUserArgs);
      expect(result).toMatchObject({
        sucess: false,
        error: `An account with Email test@email.com already exists.`,
      });
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
      expect(result).toMatchObject({
        sucess: false,
        error: 'Unexpected error from createUser',
      });
    });
  });
  describe('findUser', () => {
    it('Should fail if user does not exists', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.findUser(findUserArgs);
      expect(result).toMatchObject({
        sucess: false,
        error: 'Can not find user.',
      });
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
      expect(result).toMatchObject({
        sucess: false,
        error: 'Unexpected error from findUser',
      });
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
      expect(result).toMatchObject({
        sucess: false,
        error: 'Can not find user.',
      });
    });

    it('Should update user object', async () => {
      userRepository.findOne.mockResolvedValue(createUserArgs);
      userRepository.create.mockReturnValue(updatedUserObject);
      userRepository.save.mockResolvedValue(updatedUserObject);

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
      expect(result).toMatchObject({
        sucess: false,
        error: 'Unexpected error from updateUser while saving user infomation',
      });
    });

    it('Should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.updateUser(findUserArgs, updatedUserObject);
      expect(result).toMatchObject({
        sucess: false,
        error: 'Unexpected error from updateUser',
      });
    });
  });
  describe('deleteUser', () => {
    it('Should fail if user does not exists', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.deleteUser(findUserArgs);
      expect(result).toMatchObject({
        sucess: false,
        error: 'Can not find user.',
      });
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
      expect(result).toMatchObject({
        sucess: false,
        error: 'Unexpected error from deleteUser',
      });
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
      expect(result).toMatchObject({
        sucess: false,
        error: 'Can not find user.',
      });
    });

    it('Should sucessfully login', async () => {
      userRepository.findOne.mockResolvedValue({
        password: 'testPassword',
        checkPassword: jest.fn(() => Promise.resolve(true)),
      });
      const { sucess } = await service.login(loginArgs);
      expect(sucess).toEqual(true);
    });

    it('Should fail if input password was wrong.', async () => {
      userRepository.findOne.mockResolvedValue({
        password: 'testPassword',
        checkPassword: jest.fn(() => Promise.resolve(false)),
      });
      const result = await service.login({
        email: 'test@email.com',
        password: 'WrongPassword',
      });
      expect(result).toMatchObject({ sucess: false, error: 'Wrong password' });
    });

    it('Should fail on expection', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toMatchObject({
        sucess: false,
        error: 'Unexpected error from login',
      });
    });
  });
});
