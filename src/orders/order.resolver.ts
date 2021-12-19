import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { CreateOrderInput } from './dtos/order.dto';
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
}
