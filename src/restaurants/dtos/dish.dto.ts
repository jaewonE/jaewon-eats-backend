import {
  Field,
  InputType,
  IntersectionType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Dish } from '../entities/dish.entity';
import { FindRestaurantByIdInput } from './restaurant.dto';

@InputType()
export class ChangeAllowedProperty extends PickType(Dish, [
  'name',
  'description',
  'photo',
  'price',
  'options',
]) {}

@InputType()
export class CreateDishInput extends ChangeAllowedProperty {
  @Field(() => Number)
  @IsNumber()
  restaurantId: number;
}

@InputType()
export class FindDishInput {
  @Field(() => Number)
  @IsNumber()
  dishId: number;
}

@ObjectType()
export class FindDishOutput extends CoreOuput {
  @Field(() => Dish, { nullable: true })
  @IsOptional()
  dish?: Dish;
}

@InputType()
export class FindAllDishInput extends FindRestaurantByIdInput {}

@ObjectType()
export class FindAllDishOutput extends CoreOuput {
  @Field(() => [Dish], { nullable: true })
  @IsOptional()
  @IsArray()
  dishes?: Dish[];
}

@InputType()
export class UpdateDishInput extends IntersectionType(
  PartialType(ChangeAllowedProperty),
  FindDishInput,
) {}

@InputType()
export class DeleteDishInput extends FindDishInput {}
