import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JWT_KEY } from './auth.jwt.constant';
import { JwtService } from './auth.jwt.service';

@Injectable()
export class JWTMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (JWT_KEY in req.headers) {
        const token = req.headers[JWT_KEY];
        const decodedToken = this.jwtService.verify(token.toString());
        if (
          typeof decodedToken === 'object' &&
          decodedToken.hasOwnProperty('id')
        ) {
          req['userId'] = decodedToken['id'];
        } else {
          console.error(`No property named userId in JWT`);
        }
      } else {
        console.error(`No property named ${JWT_KEY}`);
      }
    } catch (e) {
      console.error(e);
    }
    next();
  }
}
