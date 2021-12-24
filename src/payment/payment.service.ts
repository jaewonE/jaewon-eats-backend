import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { RestaurantErrors } from 'src/restaurants/errors/restaurant.error';
import { User } from 'src/user/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import { CreatePaymentInput, FindPaymentOutput } from './dtos/payment.dto';
import { Payment } from './entities/payment.entities';
import { PaymentErrors } from './errors/payment.error';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentDB: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurantDB: Repository<Restaurant>,
  ) {}

  async createPayment(
    user: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CoreOuput> {
    try {
      const restaurant = await this.restaurantDB.findOne(restaurantId);
      if (!restaurant) {
        return RestaurantErrors.restaurantNotFound;
      }
      if (restaurant.ownerId !== user.id) {
        return RestaurantErrors.notOwner;
      }
      const promotedUntil = new Date();
      promotedUntil.setDate(promotedUntil.getDate() + 7);
      await this.paymentDB.save(
        this.paymentDB.create({
          transactionId,
          user,
          restaurant,
        }),
      );
      restaurant.isPromoted = true;
      restaurant.promotedUntil = promotedUntil;
      await this.restaurantDB.save(restaurant);
      return { sucess: true };
    } catch (e) {
      return PaymentErrors.unexpectedError('createPayment');
    }
  }

  async findPayments(
    user: User,
    { page }: PaginationInput,
  ): Promise<FindPaymentOutput> {
    try {
      const [payments, totalResult] = await this.paymentDB.findAndCount({
        where: { user },
        skip: (page - 1) * 25,
        take: 25,
      });
      if (!payments) {
        return PaymentErrors.paymentNotFound;
      }
      return {
        sucess: true,
        payments,
        totalResult,
        totalPages: Math.ceil(totalResult / 25),
      };
    } catch (e) {
      return PaymentErrors.unexpectedError('findPayments');
    }
  }

  @Cron('0 0 * * *')
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurantDB.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });
    console.log(restaurants);
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurantDB.save(restaurant);
    });
  }
}
