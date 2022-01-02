import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { LoginInput, LoginOutput } from './dtos/userAuth.dto';
import {
  CreateUserInput,
  UpdateUserInput,
  UserOutput,
  UserSelector,
} from './dtos/userCRUD.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  checkSelectorElement({ email, id }: UserSelector): {
    selector?: UserSelector;
    error?: string;
  } {
    if (email) {
      return { selector: { email } };
    } else if (id) {
      return { selector: { id } };
    } else {
      return {
        error: 'Email or ID does not exist on the input.',
      };
    }
  }

  @Mutation(() => CoreOuput)
  async createUser(
    @Args('input') createUserInput: CreateUserInput,
  ): Promise<CoreOuput> {
    return this.userService.createUser(createUserInput);
  }

  @Query(() => UserOutput)
  @Role(['Any'])
  async findUser(
    @Args('input') inputSelector: UserSelector,
  ): Promise<UserOutput> {
    const { error, selector } = this.checkSelectorElement(inputSelector);
    return error
      ? { sucess: false, error }
      : this.userService.findUser(selector);
  }
  @Mutation(() => UserOutput)
  @Role(['Any'])
  async updateUser(
    @getUserFromReq() user: User,
    @Args('input') updateUserInput: UpdateUserInput,
  ): Promise<UserOutput> {
    return this.userService.updateUser(user, updateUserInput);
  }

  @Mutation(() => CoreOuput)
  @Role(['Any'])
  async deleteUser(@getUserFromReq() user: User): Promise<UserOutput> {
    return this.userService.deleteUser(user);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Query(() => UserOutput)
  @Role(['Any'])
  async getCurrentUser(
    @getUserFromReq() user: User | null,
  ): Promise<UserOutput> {
    if (user) {
      return {
        sucess: true,
        user,
      };
    } else {
      return {
        sucess: false,
        error: 'User Not Found on Request',
        user: null,
      };
    }
  }
}
