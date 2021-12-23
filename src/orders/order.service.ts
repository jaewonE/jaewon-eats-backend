import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PADDING_ORDER,
} from 'src/common/common.constant';
import { PUB_SUB } from 'src/common/common.module';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { DishErrors } from 'src/restaurants/errors/dish.error';
import { RestaurantErrors } from 'src/restaurants/errors/restaurant.error';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateOrderInput,
  OrderIdInput,
  FindOrderOutput,
  FindOrdersInput,
  FindOrdersOutput,
  UpdateOrderInput,
} from './dtos/order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
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
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
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
      const order = await this.orderDB.save(
        this.orderDB.create({
          customer,
          restaurant,
          items: orderItems,
          total: finalPrice,
        }),
      );
      await this.pubsub.publish(NEW_PADDING_ORDER, {
        paddingOrders: { order, ownerId: restaurant.ownerId },
      });
      return {
        sucess: true,
      };
    } catch (e) {
      console.error(e);
      return OrderErrors.unexpectedError('createOrder');
    }
  }

  async findOrders(
    user: User,
    { status, page }: FindOrdersInput,
  ): Promise<FindOrdersOutput> {
    try {
      let orders: Order[] = [];
      let totalResult = 0;
      switch (user.role) {
        case UserRole.Client: {
          [orders, totalResult] = await this.orderDB.findAndCount({
            where: { customer: user, ...(status && { status }) },
            skip: (page - 1) * 25,
            take: 25,
          });
          break;
        }
        case UserRole.Delivery: {
          [orders, totalResult] = await this.orderDB.findAndCount({
            where: { driver: user, ...(status && { status }) },
            skip: (page - 1) * 25,
            take: 25,
          });
          break;
        }
        case UserRole.Owner: {
          const restaurant = await this.restaurantDB.find({
            where: { owner: user },
            relations: ['orders'],
          });
          orders = restaurant
            .map((restaurant: Restaurant) => restaurant.orders)
            .flat(1);
          if (status) {
            orders.filter((order: Order) => order.status === status);
          }
          totalResult = orders.length;
          if (totalResult > 25 && page > 1) {
            if (totalResult > page * 25) {
              orders = orders.slice((page - 1) * 25, page * 25);
            } else {
              orders = orders.slice((page - 1) * 25);
            }
          }
          break;
        }
        default: {
          throw Error('Wrong value in user.role');
        }
      }
      if (orders) {
        return {
          sucess: true,
          orders,
          totalPages: Math.ceil(totalResult / 25),
          totalResult,
        };
      } else {
        return OrderErrors.orderNotFound;
      }
    } catch (e) {
      return OrderErrors.unexpectedError('findOrders');
    }
  }

  canAccessOrder(user: User, order: Order): boolean {
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      return false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      return false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      return false;
    }
    return true;
  }

  havePermissionToEdit(userRole: string, status: OrderStatus): boolean {
    switch (userRole) {
      case UserRole.Client: {
        break;
      }
      case UserRole.Owner: {
        if (
          status === OrderStatus.Pending ||
          status === OrderStatus.Cooking ||
          status === OrderStatus.Cooked
        ) {
          return true;
        }
        break;
      }
      case UserRole.Delivery: {
        if (
          status === OrderStatus.PickedUp ||
          status === OrderStatus.Delivered
        ) {
          return true;
        }
        break;
      }
      default:
        break;
    }
    return false;
  }

  async findOrder(
    user: User,
    { id: orderId }: OrderIdInput,
  ): Promise<FindOrderOutput> {
    try {
      const order = await this.orderDB.findOne(orderId);
      if (!order) {
        return OrderErrors.orderNotFound;
      }
      if (this.canAccessOrder(user, order)) {
        return { sucess: true, order };
      } else {
        return OrderErrors.canNotAccessOrder;
      }
    } catch (e) {
      console.error(e);
      return OrderErrors.unexpectedError('findOrder');
    }
  }

  async updateOrder(
    user: User,
    { id, status }: UpdateOrderInput,
  ): Promise<CoreOuput> {
    try {
      const order = await this.orderDB.findOne(id);
      if (!order) {
        return OrderErrors.orderNotFound;
      }
      if (this.canAccessOrder(user, order)) {
        const updatedOrder = { ...order, status };
        if (this.havePermissionToEdit(user.role, status)) {
          await this.orderDB.save(updatedOrder);
          if (status === OrderStatus.Cooked) {
            await this.pubsub.publish(NEW_COOKED_ORDER, {
              cookedOrders: { order: updatedOrder },
            });
          }
          await this.pubsub.publish(NEW_ORDER_UPDATE, {
            orderUpdates: updatedOrder,
          });
          return { sucess: true };
        } else {
          return OrderErrors.dontHavePermission;
        }
      } else {
        return OrderErrors.canNotAccessOrder;
      }
    } catch (e) {
      return OrderErrors.unexpectedError('updateOrder');
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: OrderIdInput,
  ): Promise<CoreOuput> {
    try {
      const order = await this.orderDB.findOne(orderId);
      if (!order) {
        return OrderErrors.orderNotFound;
      }
      if (
        order.status === OrderStatus.PickedUp ||
        order.status === OrderStatus.Delivered
      ) {
        return OrderErrors.takenOrder;
      }
      await this.orderDB.save({
        id: orderId,
        status: OrderStatus.PickedUp,
        driver,
      });
      await this.pubsub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, status: OrderStatus.PickedUp, driver },
      });
      return { sucess: true };
    } catch (e) {
      return OrderErrors.unexpectedError('takeOrder');
    }
  }
}
