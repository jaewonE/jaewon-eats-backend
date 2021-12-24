import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { Role } from 'src/auth/role/role.decorator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import { User } from 'src/user/entities/user.entity';
import { CreatePaymentInput, FindPaymentOutput } from './dtos/payment.dto';
import { Payment } from './entities/payment.entities';
import { PaymentService } from './payment.service';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => CoreOuput)
  @Role(['Owner'])
  createPayment(
    @getUserFromReq() user: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CoreOuput> {
    return this.paymentService.createPayment(user, createPaymentInput);
  }

  @Query(() => FindPaymentOutput)
  @Role(['Owner'])
  findPayments(
    @getUserFromReq() user: User,
    @Args('input') paginationInput: PaginationInput,
  ): Promise<FindPaymentOutput> {
    return this.paymentService.findPayments(user, paginationInput);
  }
}
