import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
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
export class CategorySelector {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

@InputType()
export class GetCategoryInput extends PaginationInput {
  @Field(() => CategorySelector)
  @IsDefined()
  selector: CategorySelector;
}

@ObjectType()
export class GetCategoryOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  @IsOptional()
  category?: Category;
}

@InputType()
export class CreateCategoryInput extends PickType(Category, [
  'name',
  'coverImg',
]) {}

@InputType()
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {
  @Field(() => Int)
  @IsNumber()
  categoryId: number;
}

@InputType()
export class DeleteCategoryInput {
  @Field(() => Int)
  @IsNumber()
  id: number;
}
