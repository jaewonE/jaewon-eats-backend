import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  @Length(5)
  name: string;

  @Column()
  @Field(() => String)
  @IsString()
  coverImg: string;

  @Column()
  @Field(() => String)
  @IsString()
  address: string;

  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Category, { nullable: true })
  @IsOptional()
  category?: Category;

  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  @Field(() => User)
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  @Field(() => Number)
  ownerId: number;

  @OneToMany(() => Dish, (dish: Dish) => dish.restaurant)
  @Field(() => [Dish])
  @IsArray()
  menu: Dish[];

  @OneToMany(() => Order, (order: Order) => order.restaurant, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => [Order], { nullable: true })
  @IsArray()
  orders?: Order[];
}
