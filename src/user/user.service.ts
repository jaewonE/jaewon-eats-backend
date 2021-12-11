import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/auth/jwt/auth.jwt.service';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Repository } from 'typeorm';
import { LoginInput, LoginOutput } from './dtos/userAuth.dto';
import {
  CreateUserInput,
  UpdateUser,
  UserOutput,
  UserSelector,
} from './dtos/userCRUD.dto';
import { userErrors } from './dtos/userError.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
    private readonly jwtService: JwtService,
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
        return userErrors.userExists(createUserInput.email);
      }
    } catch (error) {
      return userErrors.unexpectedError('createUser');
    }
  }

  async findUser(selector: UserSelector): Promise<UserOutput> {
    try {
      const user = await this.userDB.findOne(selector);
      return user ? { sucess: true, user } : userErrors.userNotFound;
    } catch (error) {
      return userErrors.unexpectedError('findUser');
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
          return userErrors.unexpectedError(
            'updateUser while saving user infomation',
          );
        }
      } else {
        return userErrors.userNotFound;
      }
    } catch (error) {
      return userErrors.unexpectedError('updateUser');
    }
  }

  async deleteUser(selector: UserSelector): Promise<CoreOuput> {
    try {
      const user = await this.userDB.findOne(selector);
      if (user) {
        await this.userDB.delete(selector);
        return { sucess: true };
      } else {
        return userErrors.userNotFound;
      }
    } catch (error) {
      return userErrors.unexpectedError('deleteUser');
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.userDB.findOne(
        { email },
        { select: ['password', 'id'] },
      );
      if (user) {
        const validate = await user.checkPassword(password);
        if (validate) {
          const token = this.jwtService.sign(String(user.id));
          return { sucess: true, token };
        } else {
          return userErrors.wrongPassword;
        }
      } else {
        return userErrors.userNotFound;
      }
    } catch (error) {
      return userErrors.unexpectedError('login');
    }
  }
}
