import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Raw, Repository } from 'typeorm';
import { RestaurantCoverImg } from './entities/uploads.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(RestaurantCoverImg)
    private readonly restaurantCoverImgDB: Repository<RestaurantCoverImg>,
  ) {}

  async registCoverImg(coverImg: string): Promise<CoreOuput> {
    try {
      const exist = await this.isFileExist(coverImg);
      if (exist) {
        return { sucess: false, error: 'File already exist' };
      } else {
        await this.restaurantCoverImgDB.save(
          this.restaurantCoverImgDB.create({ coverImg }),
        );
      }
    } catch (e) {
      return { sucess: false, error: 'Unexpected error from registCoverImg' };
    }
  }

  async isFileExist(coverImg: string): Promise<boolean> {
    try {
      const coverImgList = await this.restaurantCoverImgDB.find({
        where: { coverImg: Raw((cover) => `${cover} ILIKE '%${coverImg}%'`) },
      });
      console.log(coverImgList);
      return coverImgList.length > 0 ? true : false;
    } catch (e) {
      throw new InternalServerErrorException(
        'Unexpected error f rom isFileExist',
      );
    }
  }
}
