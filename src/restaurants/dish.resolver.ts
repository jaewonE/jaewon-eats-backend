import { Resolver } from '@nestjs/graphql';
import { Dish } from './entities/dish.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
}
