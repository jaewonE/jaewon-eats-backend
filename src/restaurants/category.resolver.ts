import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { isAdmin } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { CategoryService } from './category.service';
import {
  CreateCategoryInput,
  DeleteCategoryInput,
  GetAllCategoryOutput,
  GetCategoryInput,
  GetCategoryOutput,
  UpdateCategoryInput,
} from './dtos/category.dto';
import { Category } from './entities/category.entity';
import { CategoryErrors } from './errors/category.error';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Mutation(() => CoreOuput)
  @Role(['Any'])
  createCategory(
    @isAdmin() canAccess: boolean,
    @Args('input') createCategoryInput: CreateCategoryInput,
  ): Promise<CoreOuput> {
    return canAccess
      ? this.categoryService.createCategory(createCategoryInput)
      : Promise.resolve(CategoryErrors.notAdmin);
  }

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.categoryService.restaurantCount(category);
  }

  @Query(() => GetAllCategoryOutput)
  getAllCategory(): Promise<GetAllCategoryOutput> {
    return this.categoryService.getAllCategory();
  }

  @Query(() => GetCategoryOutput)
  getCategory(
    @Args('input') { selector, page }: GetCategoryInput,
  ): Promise<GetCategoryOutput> {
    const { id, slug } = selector;
    if (id) {
      return this.categoryService.getCategory({ id }, page);
    } else if (slug) {
      return this.categoryService.getCategory({ slug }, page);
    } else {
      return Promise.resolve(CategoryErrors.noSelector);
    }
  }

  @Mutation(() => CoreOuput)
  @Role(['Any'])
  updateCategory(
    @isAdmin() canAccess: boolean,
    @Args('input') updateCategoryInput: UpdateCategoryInput,
  ): Promise<CoreOuput> {
    return canAccess
      ? this.categoryService.updateCategory(updateCategoryInput)
      : Promise.resolve(CategoryErrors.notAdmin);
  }

  @Mutation(() => CoreOuput)
  @Role(['Any'])
  deleteCategory(
    @isAdmin() canAccess: boolean,
    @Args('input') deleteCategoryInput: DeleteCategoryInput,
  ): Promise<CoreOuput> {
    return canAccess
      ? this.categoryService.deleteCategory(deleteCategoryInput)
      : Promise.resolve(CategoryErrors.notAdmin);
  }
}
