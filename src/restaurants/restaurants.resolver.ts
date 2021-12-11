import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { getUserIdFromReq } from 'src/auth/jwt/auth.jwt.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CoreOuput)
  async createRestaurant(
    @getUserIdFromReq() userId: string,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CoreOuput> {
    return this.restaurantService.createRestaurant(
      userId,
      createRestaurantInput,
    );
  }
}
