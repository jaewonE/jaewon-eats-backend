import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  GetAllCategoryOutput,
  GetCategoryInput,
  GetCategoryOutput,
} from './dtos/category.dto';
import { Category } from './entities/category.entity';
import { RestaurantService } from './restaurants.service';

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
