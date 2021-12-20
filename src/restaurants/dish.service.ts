import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import {
  CreateDishInput,
  DeleteDishInput,
  UpdateDishInput,
} from './dtos/dish.dto';
import { DishErrors } from './errors/dish.error';
import { User } from 'src/user/entities/user.entity';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantErrors } from './errors/restaurant.error';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishDB: Repository<Dish>,
    @InjectRepository(Restaurant)
    private readonly restaurantDB: Repository<Restaurant>,
  ) {}

  async createDish(
    user: User,
    createDishInput: CreateDishInput,
  ): Promise<CoreOuput> {
    try {
      const restaurant = await this.restaurantDB.findOne({
        id: createDishInput.restaurantId,
      });
      if (!restaurant) {
        return RestaurantErrors.restaurantNotFound;
      }
      if (restaurant.ownerId != user.id) {
        return RestaurantErrors.notOwner;
      }
      await this.dishDB.save(
        this.dishDB.create({ ...createDishInput, restaurant }),
      );
      return { sucess: true };
    } catch (e) {
      return DishErrors.unexpectedError('createDish');
    }
  }

  // async findAllDishById({
  //   restaurantId,
  // }: FindAllDishInput): Promise<FindAllDishOutput> {
  //   try {
  //     const restaurant = await this.restaurantDB.findOne(restaurantId, {
  //       relations: ['menu'],
  //     });
  //     if (!restaurant) {
  //       return RestaurantErrors.restaurantNotFound;
  //     }
  //     return {
  //       sucess: true,
  //       dishes: restaurant.menu,
  //     };
  //   } catch (e) {
  //     return DishErrors.unexpectedError('findDishById');
  //   }
  // }

  // async findDishById({ dishId }: FindDishInput): Promise<FindDishOutput> {
  //   try {
  //     const dish = await this.dishDB.findOne(dishId);
  //     if (!dish) {
  //       return DishErrors.dishNotFound;
  //     }
  //     return {
  //       sucess: true,
  //       dish,
  //     };
  //   } catch (e) {
  //     return DishErrors.unexpectedError('findDishById');
  //   }
  // }

  async updateDish(
    user: User,
    { dishId, ...updateDishInput }: UpdateDishInput,
  ): Promise<CoreOuput> {
    try {
      const dish = await this.dishDB.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return DishErrors.dishNotFound;
      }
      if (dish.restaurant.ownerId !== user.id) {
        return RestaurantErrors.notOwner;
      }
      await this.dishDB.save([{ id: dishId, ...updateDishInput }]);
      return { sucess: true };
    } catch (e) {
      return DishErrors.unexpectedError('updateDish');
    }
  }

  async deleteDish(
    user: User,
    { dishId }: DeleteDishInput,
  ): Promise<CoreOuput> {
    try {
      const dish = await this.dishDB.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return DishErrors.dishNotFound;
      }
      if (dish.restaurant.ownerId !== user.id) {
        return RestaurantErrors.notOwner;
      }
      await this.dishDB.delete(dishId);
      return { sucess: true };
    } catch (e) {
      return DishErrors.unexpectedError('deleteDish');
    }
  }
}
