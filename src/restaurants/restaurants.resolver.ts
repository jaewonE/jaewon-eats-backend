import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import { User } from 'src/user/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
  DeleteRestaurantInput,
  FindAllRestaurantOutput,
  FindRestaurantByIdInput,
  FindRestaurantByIdOutput,
  MyRestaurantsOutput,
  SearchRestaurantByNameInput,
  SearchRestaurantByNameOutput,
  UpdateRestaurantInput,
} from './dtos/restaurant.dto';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(['Owner'])
  createRestaurant(
    @getUserFromReq() user: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(user, createRestaurantInput);
  }

  @Query(() => FindAllRestaurantOutput)
  findAllRestaurant(
    @Args('input') paginationInput: PaginationInput,
  ): Promise<FindAllRestaurantOutput> {
    return this.restaurantService.findAllRestaurant(paginationInput);
  }

  @Query(() => FindRestaurantByIdOutput)
  findRestaurant(
    @Args('input') { restaurantId }: FindRestaurantByIdInput,
  ): Promise<FindRestaurantByIdOutput> {
    return this.restaurantService.findRestaurantById(restaurantId);
  }

  @Query(() => SearchRestaurantByNameOutput)
  searchRestaurant(
    @Args('input') { page, take, restaurantName }: SearchRestaurantByNameInput,
  ): Promise<SearchRestaurantByNameOutput> {
    return this.restaurantService.searchRestaurantByName(
      page,
      take,
      restaurantName,
    );
  }

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  updateRestaurant(
    @getUserFromReq() user: User,
    @Args('input') updateArgs: UpdateRestaurantInput,
  ): Promise<CoreOuput> {
    return this.restaurantService.updateRestaurant(user, updateArgs);
  }

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  deleteRestaurant(
    @getUserFromReq() user: User,
    @Args('input') { restaurantId }: DeleteRestaurantInput,
  ): Promise<CoreOuput> {
    return this.restaurantService.deleteRestaurant(user, restaurantId);
  }

  @Query(() => MyRestaurantsOutput)
  @Role(['Owner'])
  myRestaurants(@getUserFromReq() user: User): Promise<MyRestaurantsOutput> {
    return this.restaurantService.myRestaurants(user);
  }
}
