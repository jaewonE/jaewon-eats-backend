import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends CoreOuput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  token?: string;
}
