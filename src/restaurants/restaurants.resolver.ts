import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  async createRestaurant(
    @getUserFromReq() user: User | null,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CoreOuput> {
    if (user) {
      return this.restaurantService.createRestaurant(
        user,
        createRestaurantInput,
      );
    } else {
      return {
        sucess: false,
        error: 'User Not Found on Request',
      };
    }
  }
}
