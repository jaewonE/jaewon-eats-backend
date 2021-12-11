import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsDefined } from 'class-validator';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(() => String)
  @IsDefined()
  categoryName: string;
}
