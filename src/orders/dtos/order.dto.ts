import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { OrderItemOption } from '../entities/order-item.entity';
import { Order, OrderStatus } from '../entities/order.entity';

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

@InputType()
export class FindOrdersInput extends PaginationInput {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  status?: OrderStatus;
}

@ObjectType()
export class FindOrdersOutput extends PaginationOutput {
  @Field(() => [Order], { nullable: true })
  @IsOptional()
  orders?: Order[];
}

@InputType()
export class FindOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class FindOrderOutput extends CoreOuput {
  @Field(() => Order, { nullable: true })
  @IsOptional()
  order?: Order;
}

@InputType()
export class UpdateOrderInput extends PickType(Order, ['id', 'status']) {}
