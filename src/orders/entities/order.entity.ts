import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @ManyToOne(() => User, (user: User) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @Field(() => User, { nullable: true })
  @IsOptional()
  customer?: User;

  @RelationId((order: Order) => order.customer)
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  customerId: number;

  @ManyToOne(() => User, (user: User) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @Field(() => User, { nullable: true })
  @IsOptional()
  driver?: User;

  @RelationId((order: Order) => order.driver)
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  driverId: number;

  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @Field(() => Restaurant)
  @IsOptional()
  restaurant: Restaurant;

  @ManyToMany(() => OrderItem, { eager: true })
  @JoinTable()
  @Field(() => [OrderItem])
  @IsArray()
  items: OrderItem[];

  @Column()
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
