import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JWT_KEY } from 'src/auth/jwt/jwt.constant';
import { JwtService } from 'src/auth/jwt/jwt.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (JWT_KEY in req.headers) {
        const token = req.headers[JWT_KEY];
        const decodedToken = this.jwtService.verify(token.toString());
        if (
          typeof decodedToken === 'object' &&
          decodedToken.hasOwnProperty('id')
        ) {
          const id = Number(decodedToken['id']);
          const { user, sucess, error } = await this.userService.findUser({
            id,
          });
          if (sucess) {
            req['user'] = user;
          } else {
            console.error(error);
          }
        } else {
          console.error(`No property named userId in JWT`);
        }
      }
    } catch (e) {}
    next();
  }
}
