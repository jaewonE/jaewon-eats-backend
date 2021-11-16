import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean } from 'class-validator';

@ObjectType()
export class CoreOuput {
  @Field(() => Boolean)
  @IsBoolean()
  sucess: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
