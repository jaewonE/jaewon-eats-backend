import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from './dtos/restaurantCRUD.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async isCategoryExist(inputCategory): Promise<Category | null> {
    try {
      const categoryName = inputCategory.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      const category = await this.categories.findOne({ slug: categorySlug });
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
      const newRestaurant = this.restaurants.create(createRestaurantInput);
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
      await this.restaurants.save(newRestaurant);
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

  async updateRestaurant(
    user: User,
    updateArgs: UpdateRestaurantInput,
  ): Promise<CoreOuput> {
    try {
      const restaurant = await this.restaurants.findOne(
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
      await this.restaurants.save([
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
}
