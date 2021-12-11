import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category]), UserModule],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
