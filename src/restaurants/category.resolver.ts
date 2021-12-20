import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { adminGuard } from 'src/auth/admin.guard';
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
  @UseGuards(adminGuard)
  createCategory(
    @Args('input') createCategoryInput: CreateCategoryInput,
  ): Promise<CoreOuput> {
    return this.categoryService.createCategory(createCategoryInput);
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
  @UseGuards(adminGuard)
  updateCategory(
    @Args('input') updateCategoryInput: UpdateCategoryInput,
  ): Promise<CoreOuput> {
    return this.categoryService.updateCategory(updateCategoryInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(adminGuard)
  deleteCategory(
    @Args('input') deleteCategoryInput: DeleteCategoryInput,
  ): Promise<CoreOuput> {
    return this.categoryService.deleteCategory(deleteCategoryInput);
  }
}
