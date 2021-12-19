import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { OrderItemOption } from '../entities/order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field(() => Int)
  @IsNumber()
  dishId: number;

  @Field(() => [OrderItemOption], { nullable: true })
  @IsOptional()
  @IsArray()
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => Number)
  @IsNumber()
  restaurantId: number;

  @Field(() => [CreateOrderItemInput])
  @IsArray()
  items: CreateOrderItemInput[];
}
