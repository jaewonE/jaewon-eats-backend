import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
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
        error: `Email or ID does not exist on the input.`,
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
}
