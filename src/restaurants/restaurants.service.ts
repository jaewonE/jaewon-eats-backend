import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import { User } from 'src/user/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { CategoryService } from './category.service';

import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
  FindAllRestaurantOutput,
  FindRestaurantByIdOutput,
  MyRestaurantsOutput,
  SearchRestaurantByNameOutput,
  UpdateRestaurantInput,
} from './dtos/restaurant.dto';
import { Restaurant } from './entities/restaurants.entity';
import { CategoryErrors } from './errors/category.error';
import { RestaurantErrors } from './errors/restaurant.error';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantDB: Repository<Restaurant>,
    private readonly categoryService: CategoryService,
  ) {}

  async createRestaurant(
    user: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurantDB.create(createRestaurantInput);
      newRestaurant.owner = user;
      const category = await this.categoryService.isCategoryExist(
        createRestaurantInput.categoryName,
      );
      if (!category) {
        return CategoryErrors.categoryNotFoundWithName(
          createRestaurantInput.categoryName,
        );
      }
      newRestaurant.category = category;
      const { id: restaurantId } = await this.restaurantDB.save(newRestaurant);
      return { sucess: true, restaurantId };
    } catch {
      return RestaurantErrors.unexpectedError('createRestaurant');
    }
  }

  async findAllRestaurant({
    page,
    take,
  }: PaginationInput): Promise<FindAllRestaurantOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurantDB.findAndCount({
        take: take,
        skip: (page - 1) * take,
        order: {
          isPromoted: 'DESC',
        },
        relations: ['category'],
      });
      return {
        sucess: true,
        totalResult,
        totalPages: Math.ceil(totalResult / take),
        restaurants,
      };
    } catch (e) {
      return RestaurantErrors.unexpectedError('findAllRestaurant');
    }
  }

  async findRestaurantById(
    restaurantId: number,
  ): Promise<FindRestaurantByIdOutput> {
    try {
      const restaurant = await this.restaurantDB.findOne({
        where: { id: restaurantId },
        relations: ['category', 'menu'],
      });
      return restaurant
        ? { sucess: true, restaurant }
        : RestaurantErrors.restaurantNotFound;
    } catch (e) {
      return RestaurantErrors.unexpectedError('findRestaurantById');
    }
  }

  async searchRestaurantByName(
    page: number,
    take: number,
    restaurantName: string,
  ): Promise<SearchRestaurantByNameOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurantDB.findAndCount({
        where: { name: Raw((name) => `${name} ILIKE '%${restaurantName}%'`) },
        skip: (page - 1) * take,
        take: take,
        order: {
          isPromoted: 'DESC',
        },
      });
      return restaurants
        ? {
            sucess: true,
            restaurants,
            totalResult,
            totalPages: Math.ceil(totalResult / take),
          }
        : RestaurantErrors.restaurantNotFound;
    } catch (e) {
      return RestaurantErrors.unexpectedError('searchRestaurantByName');
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
        return RestaurantErrors.restaurantNotFound;
      }
      if (restaurant.ownerId != user.id) {
        return RestaurantErrors.notOwner;
      }
      updateArgs.name && (restaurant.name = updateArgs.name);
      updateArgs.coverImg && (restaurant.coverImg = updateArgs.coverImg);
      updateArgs.address && (restaurant.address = updateArgs.address);
      if (updateArgs.categoryName) {
        const category = await this.categoryService.isCategoryExist(
          updateArgs.categoryName,
        );
        if (!category) {
          return CategoryErrors.categoryNotFoundWithName(
            updateArgs.categoryName,
          );
        }
        restaurant.category = category;
      }
      await this.restaurantDB.save([
        { id: updateArgs.restaurantId, ...restaurant },
      ])[0];
      return { sucess: true };
    } catch (e) {
      return RestaurantErrors.unexpectedError('updateRestaurant');
    }
  }

  async deleteRestaurant(user: User, restaurantId: number): Promise<CoreOuput> {
    try {
      const restaurant = await this.restaurantDB.findOne(restaurantId);
      if (!restaurant) {
        return RestaurantErrors.restaurantNotFound;
      }
      if (restaurant.ownerId != user.id) {
        return RestaurantErrors.notOwner;
      }
      await this.restaurantDB.delete(restaurantId);
      return { sucess: true };
    } catch (e) {
      return RestaurantErrors.unexpectedError('deleteRestaurant');
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurantDB.find({ owner });
      if (!restaurants) {
        return RestaurantErrors.restaurantNotFound;
      }
      return {
        restaurants,
        sucess: true,
      };
    } catch {
      return RestaurantErrors.unexpectedError('myRestaurants');
    }
  }
}
