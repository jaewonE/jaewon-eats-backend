import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
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

@ObjectType()
export class FindAllRestaurantOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  @IsDefined()
  restaurants?: Restaurant[];
}

@InputType()
export class FindRestaurantByIdInput {
  @Field(() => Number)
  @IsNumber()
  restaurantId: number;
}

@ObjectType()
export class FindRestaurantByIdOutput extends CoreOuput {
  @Field(() => Restaurant, { nullable: true })
  @IsDefined()
  restaurant?: Restaurant;
}

@InputType()
export class SearchRestaurantByNameInput extends PaginationInput {
  @Field(() => String)
  @IsString()
  restaurantName: string;
}

@ObjectType()
export class SearchRestaurantByNameOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  @IsDefined()
  restaurants?: Restaurant[];
}

@InputType()
export class UpdateRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(() => Number)
  @IsNumber()
  restaurantId: number;
}

@InputType()
export class DeleteRestaurantInput {
  @Field(() => Number)
  @IsNumber()
  restaurantId: number;
}
