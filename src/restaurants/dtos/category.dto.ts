import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class GetAllCategoryOutput extends CoreOuput {
  @Field(() => [Category], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: Category[];
}

@InputType()
export class GetCategoryInput extends PaginationInput {
  @Field(() => String)
  @IsString()
  slug: string;
}

@ObjectType()
export class GetCategoryOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  @IsOptional()
  category?: Category;
}
