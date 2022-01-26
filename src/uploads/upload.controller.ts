import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { getUserFromReq } from 'src/auth/jwt/jwt.decorator';
import { User } from 'src/user/entities/user.entity';
import { createImageURL, multerOptions } from './multer-options';
import { getUploadPayload, IGetUploadPayloadOutput } from './upload.decorator';

@Controller('upload')
export class uploadController {
  @Post('/')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @getUploadPayload() { user, restaurantName }: IGetUploadPayloadOutput,
  ) {
    return {
      status: 200,
      message: '파일 업로드를 성공하였습니다.',
      data: {
        file: createImageURL({
          name: `${user.id}_${restaurantName}${file.originalname.slice(
            file.originalname.lastIndexOf('.'),
          )}`,
        }),
      },
    };
  }
}
