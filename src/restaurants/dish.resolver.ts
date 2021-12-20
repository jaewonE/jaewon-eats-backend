import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { DishService } from './dish.service';
import {
  CreateDishInput,
  DeleteDishInput,
  UpdateDishInput,
} from './dtos/dish.dto';
import { Dish } from './entities/dish.entity';

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly dishService: DishService) {}

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  createDish(
    @getUserFromReq() user: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CoreOuput> {
    return this.dishService.createDish(user, createDishInput);
  }

  // @Query(() => FindDishOutput)
  // findDish(
  //   @Args('input') findDishInput: FindDishInput,
  // ): Promise<FindDishOutput> {
  //   return this.dishService.findDishById(findDishInput);
  // }

  // @Query(() => FindAllDishOutput)
  // findAllDish(
  //   @Args('input') findAllDishInput: FindAllDishInput,
  // ): Promise<FindAllDishOutput> {
  //   return this.dishService.findAllDishById(findAllDishInput);
  // }

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  updateDish(
    @getUserFromReq() user: User,
    @Args('input') updateDishInput: UpdateDishInput,
  ): Promise<CoreOuput> {
    return this.dishService.updateDish(user, updateDishInput);
  }

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  deleteDish(
    @getUserFromReq() user: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<CoreOuput> {
    return this.dishService.deleteDish(user, deleteDishInput);
  }
}
