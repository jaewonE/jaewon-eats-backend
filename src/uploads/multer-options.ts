import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { RESTAURANT_NAME_KEY } from './upload.middleware';

const mainPath = 'public';
const uploadPath = `${mainPath}/images`;

export const multerOptions = {
  fileFilter: (_, file, callback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      // 이미지 형식은 jpg, jpeg, png만 허용합니다.
      callback(null, true);
    } else {
      callback(new BadRequestException(), false);
    }
  },

  storage: diskStorage({
    destination: (request, file, callback) => {
      if (!existsSync(mainPath)) {
        mkdirSync(mainPath);
      }
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      callback(null, uploadPath);
    },
    filename: (request, file, callback) => {
      const user = request['user'];
      const restaurantName = request[RESTAURANT_NAME_KEY];
      if (user?.id && restaurantName) {
        callback(
          null,
          `${user.id}_${restaurantName}${file.originalname.slice(
            file.originalname.lastIndexOf('.'),
          )}`,
        );
      } else {
        throw new HttpException(
          'No user found on http request',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    },
  }),
};

interface ICreateImageURL {
  file?: Express.Multer.File;
  name?: string;
}

export const createImageURL = ({ file, name }: ICreateImageURL): string => {
  if (file) return `${uploadPath}/${file.originalname}`;
  else if (name) return `${uploadPath}/${name}`;
  else throw new Error('createImageURL function need more than one arguments.');
};
