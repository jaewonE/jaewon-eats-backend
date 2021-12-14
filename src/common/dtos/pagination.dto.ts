import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOuput } from './coreOutput.dto';

@InputType()
export class PaginationInput {
  @Field(() => Number)
  @IsNumber()
  page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOuput {
  @Field(() => Number, { nullable: true })
  @IsNumber()
  totalPages?: number;
}
