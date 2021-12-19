import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { DishErrors } from 'src/restaurants/errors/dish.error';
import { RestaurantErrors } from 'src/restaurants/errors/restaurant.error';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput } from './dtos/order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderErrors } from './errors/order.error';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantDB: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishDB: Repository<Dish>,
    @InjectRepository(Order)
    private readonly orderDB: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemDB: Repository<OrderItem>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CoreOuput> {
    try {
      const restaurant = await this.restaurantDB.findOne(restaurantId);
      if (!restaurant) {
        return RestaurantErrors.restaurantNotFound;
      }
      let finalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishDB.findOne(item.dishId);
        if (!dish) {
          return DishErrors.dishNotFound;
        }
        let dishPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name == itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishPrice += dishOption.extra;
            } else {
              const dishChoice = dishOption.choices.find(
                (dishOption) => dishOption.name == itemOption.name,
              );
              if (dishChoice) {
                if (dishChoice.extra) {
                  dishPrice += dishOption.extra;
                }
              }
            }
          }
        }
        finalPrice += dishPrice;
        const orderItem = await this.orderItemDB.save(
          this.orderItemDB.create({ dish, options: item.options }),
        );
        orderItems.push(orderItem);
      }
      await this.orderDB.save(
        this.orderDB.create({
          customer,
          restaurant,
          items: orderItems,
          total: finalPrice,
        }),
      );
      return {
        sucess: true,
      };
    } catch (e) {
      return OrderErrors.unexpectedError('createOrder');
    }
  }
}
