import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'description',
  'photo',
  'price',
  'options',
]) {
  @Field(() => Number)
  @IsNumber()
  restaurantId: number;
}
