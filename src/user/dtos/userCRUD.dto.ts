import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsEmail, IsNumber, IsOptional } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from '../entities/user.entity';

@InputType()
export class UserSelector {
  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  id?: number;

  @IsEmail()
  @IsOptional()
  @Field(() => String, { nullable: true })
  email?: string;
}

@InputType()
export class CreateUserInput extends PickType(User, [
  'name',
  'age',
  'email',
  'password',
  'gender',
  'role',
]) {}

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

@ObjectType()
export class UserOutput extends CoreOuput {
  @IsOptional()
  @Field(() => User, { nullable: true, defaultValue: null })
  user?: User;
}
