import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/auth/jwt/jwt.service';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Repository } from 'typeorm';
import { LoginInput, LoginOutput } from './dtos/userAuth.dto';
import {
  CreateUserInput,
  UpdateUserInput,
  UserOutput,
  UserSelector,
} from './dtos/userCRUD.dto';
import { userErrors } from './errors/user.error';
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
    currentUser: User,
    payload: UpdateUserInput,
  ): Promise<UserOutput> {
    try {
      const user = await this.userDB.findOne(currentUser.id);
      if (user) {
        if (payload.email) {
          user.email = payload.email;
          user.emailVarifed = false;
        }
        if (payload.password) user.password = payload.password;
        if (payload.age) user.age = payload.age;
        if (payload.name) user.name = payload.name;
        if (payload.gender) user.gender = payload.gender;
        if (payload.role) user.role = payload.role;
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

  async deleteUser(currentUser: User): Promise<CoreOuput> {
    try {
      const user = await this.userDB.findOne(currentUser.id);
      if (user) {
        await this.userDB.delete({ id: user.id });
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
