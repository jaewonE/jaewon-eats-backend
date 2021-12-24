import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsArray, IsOptional } from 'class-validator';
import { PaginationOutput } from 'src/common/dtos/pagination.dto';
import { Payment } from '../entities/payment.entities';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionId',
  'restaurantId',
]) {}

@ObjectType()
export class FindPaymentOutput extends PaginationOutput {
  @Field(() => [Payment], { nullable: true })
  @IsOptional()
  @IsArray()
  payments?: Payment[];
}
