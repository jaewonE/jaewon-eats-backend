import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { getUserIdFromReq } from 'src/auth/jwt/auth.jwt.decorator';
import { IsUserIdInReq } from 'src/auth/jwt/auth.jwt.guard';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { LoginInput, LoginOutput } from './dtos/userAuth.dto';
import {
  CreateUserInput,
  UpdateUser,
  UpdateUserInput,
  UserOutput,
  UserSelector,
} from './dtos/userCRUD.dto';
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

  checkPayload(payload: UpdateUser): { noElementError?: string } {
    if (!Object.keys(payload).length) {
      return {
        noElementError:
          'The element to be updated does not exist in the payload.',
      };
    } else return {};
  }

  @Mutation(() => CoreOuput)
  async createUser(
    @Args('input') createUserInput: CreateUserInput,
  ): Promise<CoreOuput> {
    return this.userService.createUser(createUserInput);
  }

  @Query(() => UserOutput)
  async findUser(
    @Args('input') inputSelector: UserSelector,
  ): Promise<UserOutput> {
    const { error, selector } = this.checkSelectorElement(inputSelector);
    return error
      ? { sucess: false, error }
      : this.userService.findUser(selector);
  }
  @Mutation(() => UserOutput)
  async updateUser(
    @Args('input') updateUserInput: UpdateUserInput,
  ): Promise<UserOutput> {
    const { noElementError } = this.checkPayload(updateUserInput.payload);
    if (noElementError) {
      return { sucess: false, error: noElementError };
    } else {
      const { error, selector } = this.checkSelectorElement(
        updateUserInput.selector,
      );
      return error
        ? { sucess: false, error }
        : this.userService.updateUser(selector, updateUserInput.payload);
    }
  }

  @Mutation(() => CoreOuput)
  async deleteUser(
    @Args('input') inputSelector: UserSelector,
  ): Promise<UserOutput> {
    const { error, selector } = this.checkSelectorElement(inputSelector);
    return error
      ? { sucess: false, error }
      : this.userService.deleteUser(selector);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Query(() => UserOutput)
  @UseGuards(IsUserIdInReq)
  async getCurrentUser(
    @getUserIdFromReq() userId: number,
  ): Promise<UserOutput> {
    return await this.userService.getCurrentUser(userId);
  }
}
