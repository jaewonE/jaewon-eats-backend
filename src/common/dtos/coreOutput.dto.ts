import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class CoreOuput {
  @Field(() => Boolean)
  @IsBoolean()
  sucess: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  error?: string;
}
