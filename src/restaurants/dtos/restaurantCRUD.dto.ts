import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(() => String)
  @IsString()
  categoryName: string;
}

@InputType()
export class UpdateRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(() => Number)
  @IsNumber()
  restaurantId: number;
}
