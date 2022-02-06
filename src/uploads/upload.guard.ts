import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UploadService } from './upload.service';

@Injectable()
export class SameFileExist implements CanActivate {
  constructor(private readonly uploadService: UploadService) {}
  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user;
    const restaurantName = context.getArgByIndex(0)['restaurant-name'];
    if (!user || !restaurantName) {
      return false;
    }
    const uploadFileName = `${user.id}-${restaurantName}`;
    const exist = await this.uploadService.isFileExist(uploadFileName);
    return !exist;
  }
}
