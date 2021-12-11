import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    private readonly userService: UserService,
  ) {}

  async createRestaurant(
    userId: string,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CoreOuput> {
    try {
      const { user, sucess, error } = await this.userService.findUser({
        id: Number(userId),
      });
      if (sucess) {
        const newRestaurant = this.restaurants.create(createRestaurantInput);
        newRestaurant.owner = user;
        const categoryName = createRestaurantInput.categoryName
          .trim()
          .toLowerCase();
        const categorySlug = categoryName.replace(/ /g, '-');
        const category = await this.categories.findOne({ slug: categorySlug });
        if (!category) {
          return {
            sucess: false,
            error: `No category name with ${createRestaurantInput.categoryName}.`,
          };
        }
        newRestaurant.category = category;
        await this.restaurants.save(newRestaurant);
        return {
          sucess: true,
        };
      } else {
        return {
          sucess: false,
          error: error,
        };
      }
    } catch {
      return {
        sucess: false,
        error: 'Could not create restaurant',
      };
    }
  }
}
