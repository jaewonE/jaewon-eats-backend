import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RESTAURANT_NAME_KEY } from './upload.middleware';

export interface IGetUploadPayloadOutput {
  user: any;
  restaurantName: string;
}

export const getUploadPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return {
      user: request['user'],
      restaurantName: request[RESTAURANT_NAME_KEY],
    };
  },
);
