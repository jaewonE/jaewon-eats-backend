import {
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './multer-options';
import { getUploadPayload, IGetUploadPayloadOutput } from './upload.decorator';
import { SameFileExist } from './upload.guard';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/')
  @UseGuards(SameFileExist)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @getUploadPayload() { user, restaurantName }: IGetUploadPayloadOutput,
  ) {
    try {
      const uploadFileName = `${
        user.id
      }-${restaurantName}${file.originalname.slice(
        file.originalname.lastIndexOf('.'),
      )}`;
      await this.uploadService.registCoverImg(uploadFileName);
      return {
        status: 200,
        message: 'Sucessfully upload file.',
        data: {
          file: uploadFileName,
        },
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
