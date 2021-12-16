import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}
registerEnumType(UserRole, { name: 'UserRole' });

enum UserGender {
  Male,
  Female,
  Genderless,
}
registerEnumType(UserGender, { name: 'UserGender' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity('User')
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  name: string;

  @Column({ nullable: true })
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  age?: number;

  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ type: 'enum', enum: UserGender, nullable: true })
  @Field(() => UserGender, { nullable: true })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  emailVarifed: boolean;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  @Field(() => [Restaurant])
  restaurants: Restaurant[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.error(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(inputPw: string): Promise<boolean> {
    try {
      return await bcrypt.compare(inputPw, this.password);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}
