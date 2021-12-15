import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { CreateDishInput } from './dtos/dish.dto';
import { Dish } from './entities/dish.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  createDish(
    @getUserFromReq() user: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CoreOuput> {
    return this.restaurantService.createDish(user, createDishInput);
  }
}
