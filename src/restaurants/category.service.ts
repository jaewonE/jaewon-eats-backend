import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Repository } from 'typeorm';
import {
  CategorySelector,
  CreateCategoryInput,
  DeleteCategoryInput,
  GetAllCategoryOutput,
  GetCategoryOutput,
  UpdateCategoryInput,
} from './dtos/category.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';
import { CategoryErrors } from './errors/category.error';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryDB: Repository<Category>,
    @InjectRepository(Restaurant)
    private readonly restaurantDB: Repository<Restaurant>,
  ) {}

  getCategorySlug(inputCategory: string): string {
    const categoryName = inputCategory.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    return categorySlug;
  }

  async isCategoryExist(inputCategory: string): Promise<Category | null> {
    try {
      const categorySlug = this.getCategorySlug(inputCategory);
      const category = await this.categoryDB.findOne({ slug: categorySlug });
      return category ? category : null;
    } catch (e) {
      return null;
    }
  }

  async createCategory(
    createCategoryInput: CreateCategoryInput,
  ): Promise<CoreOuput> {
    const categorySlug = this.getCategorySlug(createCategoryInput.name);
    const isCategoryExist = await this.categoryDB.find({
      where: { slug: categorySlug },
    });
    if (isCategoryExist.length) {
      return CategoryErrors.categoryalreadyExist;
    }
    await this.categoryDB.save(
      this.categoryDB.create({ ...createCategoryInput, slug: categorySlug }),
    );
    return { sucess: true };
    try {
    } catch (e) {
      return CategoryErrors.unexpectedError('createCategory');
    }
  }

  async getAllCategory(): Promise<GetAllCategoryOutput> {
    try {
      const categories = await this.categoryDB.find();
      return categories
        ? { sucess: true, categories }
        : CategoryErrors.categoryNotFound;
    } catch {
      return CategoryErrors.unexpectedError('getAllCategory');
    }
  }

  async restaurantCount(category: Category): Promise<number> {
    try {
      return await this.restaurantDB.count({ category });
    } catch (e) {
      return 0;
    }
  }

  async getCategory(
    selector: CategorySelector,
    page: number,
  ): Promise<GetCategoryOutput> {
    try {
      const category = await this.categoryDB.findOne(selector);
      if (!category) {
        return CategoryErrors.categoryNotFound;
      }
      const totalResult = await this.restaurantCount(category);
      const restaurants = await this.restaurantDB.find({
        where: { category },
        take: 25,
        skip: (page - 1) * 25,
      });
      category.restaurants = restaurants;
      return {
        sucess: true,
        category,
        totalResult,
        totalPages: Math.ceil(totalResult / 25),
      };
    } catch {
      return CategoryErrors.unexpectedError('getCategory');
    }
  }

  async updateCategory(
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<CoreOuput> {
    try {
      const category = await this.categoryDB.findOne(
        updateCategoryInput.categoryId,
      );
      if (!category) {
        return CategoryErrors.categoryNotFound;
      }
      if (updateCategoryInput.name) {
        category.name = updateCategoryInput.name;
        const categorySlug = this.getCategorySlug(updateCategoryInput.name);
        category.slug = categorySlug;
      }
      if (updateCategoryInput.coverImg) {
        category.coverImg = updateCategoryInput.coverImg;
      }
      await this.categoryDB.save([
        { id: updateCategoryInput.categoryId, ...category },
      ]);
      return { sucess: true };
    } catch (e) {
      return CategoryErrors.unexpectedError('updateCategory');
    }
  }

  async deleteCategory({
    id: categoryId,
  }: DeleteCategoryInput): Promise<CoreOuput> {
    try {
      const category = await this.categoryDB.findOne(categoryId);
      if (!category) {
        return CategoryErrors.categoryNotFound;
      }
      await this.categoryDB.delete(categoryId);
      return { sucess: true };
    } catch (e) {
      return CategoryErrors.unexpectedError('deleteCategory');
    }
  }
}
