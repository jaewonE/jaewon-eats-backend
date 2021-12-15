import { Field, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

@ObjectType()
export class DishOptionDto {
  @Field(() => String)
  @IsString()
  optionName: string;

  @Field(() => Number)
  @IsNumber()
  extraPrice: number;
}
