import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from '../entities/user.entity';

@InputType()
export class UserSelector {
  @Field(() => Number, { nullable: true })
  id?: number;

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
  @Field(() => UserSelector)
  selector: UserSelector;

  @Field(() => UpdateUser)
  payload: UpdateUser;
}

@ObjectType()
export class UserOutput extends CoreOuput {
  @Field(() => User, { nullable: true, defaultValue: null })
  user?: User;
}
