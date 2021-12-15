import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import { User } from 'src/user/entities/user.entity';
import {
  GetAllCategoryOutput,
  GetCategoryInput,
  GetCategoryOutput,
} from './dtos/category.dto';
import {
  CreateRestaurantInput,
  DeleteRestaurantInput,
  FindAllRestaurantOutput,
  FindRestaurantByIdInput,
  FindRestaurantByIdOutput,
  SearchRestaurantByNameInput,
  SearchRestaurantByNameOutput,
  UpdateRestaurantInput,
} from './dtos/restaurantCRUD.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  createRestaurant(
    @getUserFromReq() user: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CoreOuput> {
    return this.restaurantService.createRestaurant(user, createRestaurantInput);
  }

  @Query(() => FindAllRestaurantOutput)
  findAllRestaurant(
    @Args('input') { page }: PaginationInput,
  ): Promise<FindAllRestaurantOutput> {
    return this.restaurantService.findAllRestaurant(page);
  }

  @Query(() => FindRestaurantByIdOutput)
  findRestaurant(
    @Args('input') { restaurantId }: FindRestaurantByIdInput,
  ): Promise<FindRestaurantByIdOutput> {
    return this.restaurantService.findRestaurantById(restaurantId);
  }

  @Query(() => SearchRestaurantByNameOutput)
  searchRestaurant(
    @Args('input') { page, restaurantName }: SearchRestaurantByNameInput,
  ): Promise<SearchRestaurantByNameOutput> {
    return this.restaurantService.searchRestaurantByName(page, restaurantName);
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
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(() => GetAllCategoryOutput)
  getAllCategory(): Promise<GetAllCategoryOutput> {
    return this.restaurantService.getAllCategory();
  }

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.restaurantCount(category);
  }

  @Query(() => GetCategoryOutput)
  getCategory(
    @Args('input') { slug, page }: GetCategoryInput,
  ): Promise<GetCategoryOutput> {
    return this.restaurantService.getCategory(slug, page);
  }
}
