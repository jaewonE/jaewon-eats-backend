import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  transactionId: string;

  @ManyToOne(() => User, (user: User) => user.payments)
  @Field(() => User)
  @IsDefined()
  user: User;

  @RelationId((payment: Payment) => payment.user)
  @Field(() => Number)
  @IsNumber()
  userId: number;

  @ManyToOne(() => Restaurant)
  @Field(() => Restaurant)
  @IsDefined()
  restaurant: Restaurant;

  @RelationId((payment: Payment) => payment.restaurant)
  @Field(() => Number)
  @IsNumber()
  restaurantId: number;
}
