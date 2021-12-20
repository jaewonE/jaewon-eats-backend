import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import {
  CreateOrderInput,
  FindOrderInput,
  FindOrderOutput,
  FindOrdersInput,
  FindOrdersOutput,
  UpdateOrderInput,
} from './dtos/order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

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
    @Args('input') findOrderInput: FindOrderInput,
  ): Promise<FindOrderOutput> {
    return this.orderService.findOrder(user, findOrderInput);
  }

  @Mutation(() => CoreOuput)
  @Role(['Delivery', 'Owner'])
  updateOrder(
    @getUserFromReq() user: User,
    @Args('input') updateOrderInput: UpdateOrderInput,
  ): Promise<CoreOuput> {
    return this.orderService.updateOrder(user, updateOrderInput);
  }
}
