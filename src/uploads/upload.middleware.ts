import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JWT_KEY } from 'src/auth/jwt/jwt.constant';
import { JwtService } from 'src/auth/jwt/jwt.service';
import { UserRole } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

export const RESTAURANT_NAME_KEY = 'restaurant-name';

@Injectable()
export class uploadMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers[JWT_KEY];
      const restaurantName = req.headers[RESTAURANT_NAME_KEY];
      if (token && restaurantName) {
        const decodedToken = this.jwtService.verify(token.toString());
        if (
          typeof decodedToken === 'object' &&
          decodedToken.hasOwnProperty('id')
        ) {
          const { sucess, error, user } = await this.userService.findUser({
            id: decodedToken['id'],
          });
          if (sucess) {
            if (user.role === UserRole.Owner) {
              req['user'] = user;
              req[RESTAURANT_NAME_KEY] = decodeURI(
                typeof restaurantName === 'string'
                  ? restaurantName
                  : restaurantName[0],
              );
            } else {
              throw new ForbiddenException(
                'Do not have permission to create restaurant.',
              );
            }
          } else {
            throw new NotFoundException(error);
          }
        }
      } else {
        throw new NotFoundException('token not found');
      }
    } catch (e) {
      console.error(e);
    }
    next();
  }
}
