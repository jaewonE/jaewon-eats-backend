import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Repository } from 'typeorm';
import { LoginInput } from './dtos/userAuth.dto';
import {
  CreateUserInput,
  UpdateUser,
  UserOutput,
  UserSelector,
} from './dtos/userCRUD.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
  ) {}

  async createUser(createUserInput: CreateUserInput): Promise<CoreOuput> {
    try {
      const isExist = await this.userDB.findOne({
        email: createUserInput.email,
      });
      if (!isExist) {
        await this.userDB.save(this.userDB.create({ ...createUserInput }));
        return {
          sucess: true,
        };
      } else {
        return {
          sucess: false,
          error: `An account with Email ${createUserInput.email} already exists.`,
        };
      }
    } catch (error) {
      return { sucess: false, error: 'Unexpected error from createUser' };
    }
  }

  async findUser(selector: UserSelector): Promise<UserOutput> {
    try {
      const user = await this.userDB.findOne(selector);
      return user
        ? { sucess: true, user }
        : { sucess: false, error: 'Can not find user.' };
    } catch (error) {
      return { sucess: false, error: 'Unexpected error from findUser' };
    }
  }

  async updateUser(
    selector: UserSelector,
    payload: UpdateUser,
  ): Promise<UserOutput> {
    try {
      const user = await this.userDB.findOne(selector);
      if (user) {
        if (payload.email) {
          user.email = payload.email;
          user.emailVarifed = false;
        }
        if (payload.password) user.password = payload.password;
        if (payload.age) user.age = payload.age;
        if (payload.name) user.name = payload.name;
        try {
          await this.userDB.save(this.userDB.create(user));
          return { sucess: true, user };
        } catch (error) {
          return {
            sucess: false,
            error:
              'Unexpected error from updateUser while saving user infomation',
          };
        }
      } else {
        return { sucess: false, error: 'Can not find user.' };
      }
    } catch (error) {
      return { sucess: false, error: 'Unexpected error from updateUser' };
    }
  }

  async deleteUser(selector: UserSelector): Promise<CoreOuput> {
    try {
      const user = await this.userDB.findOne(selector);
      if (user) {
        await this.userDB.delete(selector);
        return { sucess: true };
      } else {
        return { sucess: false, error: 'Can not find user.' };
      }
    } catch (error) {
      return { sucess: false, error: 'Unexpected error from deleteUser' };
    }
  }

  async login({ email, password }: LoginInput): Promise<CoreOuput> {
    try {
      const user = await this.userDB.findOne(
        { email },
        { select: ['password'] },
      );
      if (user) {
        return (await user.checkPassword(password))
          ? { sucess: true }
          : { sucess: false, error: 'Wrong password' };
      } else {
        return { sucess: false, error: 'Can not find user.' };
      }
    } catch (e) {
      return { sucess: false, error: 'Unexpected error from login' };
    }
  }
}
