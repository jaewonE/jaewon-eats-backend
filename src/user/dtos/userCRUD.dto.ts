import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsDefined, IsEmail, IsNumber, IsOptional } from 'class-validator';
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
export class UpdateUser extends PartialType(CreateUserInput) {}

@InputType()
export class UpdateUserInput {
  @IsDefined()
  @Field(() => UserSelector)
  selector: UserSelector;

  @IsDefined()
  @Field(() => UpdateUser)
  payload: UpdateUser;
}

@ObjectType()
export class UserOutput extends CoreOuput {
  @IsOptional()
  @Field(() => User, { nullable: true, defaultValue: null })
  user?: User;
}
