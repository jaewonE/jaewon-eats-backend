import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsDefined, IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurants.entity';

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
@Entity()
class DishOption {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => Number)
  @IsNumber()
  extraPrice: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column()
  @IsString()
  photo?: string;

  @Field(() => String, { nullable: true })
  @Column()
  @IsString()
  @Length(5, 100)
  description?: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  @IsDefined()
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => DishOption)
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
