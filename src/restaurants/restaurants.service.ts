import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { GetAllCategoryOutput, GetCategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  FindAllRestaurantOutput,
  FindRestaurantByIdOutput,
  SearchRestaurantByNameOutput,
  UpdateRestaurantInput,
} from './dtos/restaurantCRUD.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantDB: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryDB: Repository<Category>,
  ) {}

  async isCategoryExist(inputCategory): Promise<Category | null> {
    try {
      const categoryName = inputCategory.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      const category = await this.categoryDB.findOne({ slug: categorySlug });
      return category ? category : null;
    } catch (e) {
      return null;
    }
  }
  async createRestaurant(
    user: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CoreOuput> {
    try {
      const newRestaurant = this.restaurantDB.create(createRestaurantInput);
      newRestaurant.owner = user;
      const category = await this.isCategoryExist(
        createRestaurantInput.categoryName,
      );
      if (!category) {
        return {
          sucess: false,
          error: `No category name with ${createRestaurantInput.categoryName}.`,
        };
      }
      newRestaurant.category = category;
      await this.restaurantDB.save(newRestaurant);
      return {
        sucess: true,
      };
    } catch {
      return {
        sucess: false,
        error: 'Unexpected error from createRestaurant',
      };
    }
  }

  async findAllRestaurant(page: number): Promise<FindAllRestaurantOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurantDB.findAndCount({
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        sucess: true,
        totalResult,
        totalPages: Math.ceil(totalResult / 25),
        restaurants,
      };
    } catch (e) {
      return {
        sucess: false,
        error: 'Unexpected error from findAllRestaurant',
      };
    }
  }

  async findRestaurantById(
    restaurantId: number,
  ): Promise<FindRestaurantByIdOutput> {
    try {
      const restaurant = await this.restaurantDB.findOne({ id: restaurantId });
      return restaurant
        ? { sucess: true, restaurant }
        : { sucess: false, error: 'Restaurant not found.' };
    } catch (e) {
      return {
        sucess: false,
        error: 'Unexpected error from findRestaurantById',
      };
    }
  }

  async searchRestaurantByName(
    page: number,
    restaurantName: string,
  ): Promise<SearchRestaurantByNameOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurantDB.findAndCount({
        where: { name: Raw((name) => `${name} ILIKE '%${restaurantName}%'`) },
        skip: (page - 1) * 25,
        take: 25,
      });
      return restaurants
        ? {
            sucess: true,
            restaurants,
            totalResult,
            totalPages: Math.ceil(totalResult / 25),
          }
        : { sucess: false, error: 'Restaurant not found.' };
    } catch (e) {
      return {
        sucess: false,
        error: 'Unexpected error from findRestaurantById',
      };
    }
  }

  async updateRestaurant(
    user: User,
    updateArgs: UpdateRestaurantInput,
  ): Promise<CoreOuput> {
    try {
      const restaurant = await this.restaurantDB.findOne(
        updateArgs.restaurantId,
      );
      if (!restaurant) {
        return {
          sucess: false,
          error: 'Restaurant Not Found',
        };
      }
      if (restaurant.ownerId != user.id) {
        return {
          sucess: false,
          error: 'Access denied: not a owner of this restaurant.',
        };
      }
      updateArgs.name && (restaurant.name = updateArgs.name);
      updateArgs.coverImg && (restaurant.coverImg = updateArgs.coverImg);
      updateArgs.address && (restaurant.address = updateArgs.address);
      if (updateArgs.categoryName) {
        const category = await this.isCategoryExist(updateArgs.categoryName);
        if (!category) {
          return {
            sucess: false,
            error: `No category name with ${updateArgs.categoryName}.`,
          };
        }
        restaurant.category = category;
      }
      await this.restaurantDB.save([
        { id: updateArgs.restaurantId, ...restaurant },
      ])[0];
      return { sucess: true };
    } catch (e) {
      return {
        sucess: false,
        error: 'Unexpected error from updateRestaurant',
      };
    }
  }

  async deleteRestaurant(user: User, restaurantId: number): Promise<CoreOuput> {
    try {
      const restaurant = await this.restaurantDB.findOne(restaurantId);
      if (!restaurant) {
        return {
          sucess: false,
          error: 'Restaurant Not Found',
        };
      }
      if (restaurant.ownerId != user.id) {
        return {
          sucess: false,
          error: 'Access denied: not a owner of this restaurant.',
        };
      }
      await this.restaurantDB.delete(restaurantId);
      return { sucess: true };
    } catch (e) {
      return {
        sucess: false,
        error: 'Unexpected error from deleteRestaurant',
      };
    }
  }

  async getAllCategory(): Promise<GetAllCategoryOutput> {
    try {
      const categories = await this.categoryDB.find();
      return categories
        ? { sucess: true, categories }
        : { sucess: false, error: 'Category not found.' };
    } catch {
      return {
        sucess: false,
        error: 'Unexpected error from deleteRestaurant',
      };
    }
  }

  async restaurantCount(category: Category): Promise<number> {
    try {
      return await this.restaurantDB.count({ category });
    } catch (e) {
      return 0;
    }
  }

  async getCategory(slug: string, page: number): Promise<GetCategoryOutput> {
    try {
      const category = await this.categoryDB.findOne({ slug });
      if (!category) {
        return { sucess: false, error: 'Category not found.' };
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
      return {
        sucess: false,
        error: 'Unexpected error from deleteRestaurant',
      };
    }
  }
}
