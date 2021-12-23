import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PADDING_ORDER,
} from 'src/common/common.constant';
import { PUB_SUB } from 'src/common/common.module';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User, UserRole } from 'src/user/entities/user.entity';
import {
  CreateOrderInput,
  OrderIdInput,
  FindOrderOutput,
  FindOrdersInput,
  FindOrdersOutput,
  UpdateOrderInput,
} from './dtos/order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(() => CoreOuput)
  @Role(['Client'])
  createOrder(
    @getUserFromReq() user: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CoreOuput> {
    return this.orderService.createOrder(user, createOrderInput);
  }

  @Query(() => FindOrdersOutput)
  @Role(['Any'])
  findOrders(
    @getUserFromReq() user: User,
    @Args('input') findOrdersInput: FindOrdersInput,
  ): Promise<FindOrdersOutput> {
    return this.orderService.findOrders(user, findOrdersInput);
  }

  @Query(() => FindOrderOutput)
  @Role(['Any'])
  findOrder(
    @getUserFromReq() user: User,
    @Args('input') orderIdInput: OrderIdInput,
  ): Promise<FindOrderOutput> {
    return this.orderService.findOrder(user, orderIdInput);
  }

  @Mutation(() => CoreOuput)
  @Role(['Delivery', 'Owner'])
  updateOrder(
    @getUserFromReq() user: User,
    @Args('input') updateOrderInput: UpdateOrderInput,
  ): Promise<CoreOuput> {
    return this.orderService.updateOrder(user, updateOrderInput);
  }

  @Mutation(() => CoreOuput)
  @Role(['Delivery'])
  takeOrder(
    @getUserFromReq() user: User,
    @Args('input') orderIdInput: OrderIdInput,
  ): Promise<CoreOuput> {
    return this.orderService.takeOrder(user, orderIdInput);
  }

  @Subscription(() => Order, {
    filter: ({ paddingOrders: { ownerId } }, _, { user }: { user: User }) => {
      return ownerId === user.id;
    },
    resolve: ({ paddingOrders: { order } }) => order,
  })
  @Role(['Owner'])
  paddingOrders() {
    return this.pubsub.asyncIterator(NEW_PADDING_ORDER);
  }

  @Subscription(() => Order, {
    resolve: ({ cookedOrders: { order } }) => order,
  })
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input: { id } }: { input: OrderIdInput },
      { user }: { user: User },
    ) => {
      if (order.id === id) {
        if (user.role === UserRole.Client && order.customerId === user.id) {
          return true;
        }
        if (user.role === UserRole.Delivery && order.driverId === user.id) {
          return true;
        }
        if (
          user.role === UserRole.Owner &&
          order.restaurant.ownerId === user.id
        ) {
          return true;
        }
        return false;
      } else {
        return false;
      }
    },
  })
  @Role(['Any'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  orderUpdates(@Args('input') orderIdInput: OrderIdInput) {
    return this.pubsub.asyncIterator(NEW_ORDER_UPDATE);
  }
}
