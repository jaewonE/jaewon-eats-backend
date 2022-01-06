import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { JWT_KEY } from './jwt/jwt.constant';
import { JwtService } from './jwt/jwt.service';
import { ROLES_META } from './role/role.constant';
import { AllowedRoles } from './role/role.decorator';

@Injectable()
export class AuthAppGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      ROLES_META,
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    let token: string;
    if (gqlContext['token']) {
      token = gqlContext.token;
    } else if (gqlContext?.req?.headers[JWT_KEY]) {
      token = gqlContext.req.headers[JWT_KEY];
    } else {
      return false;
    }
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { sucess, error, user } = await this.userService.findUser({
          id: decoded['id'],
        });
        if (sucess) {
          gqlContext['user'] = user;
          if (roles.includes('Any')) {
            return true;
          }
          return roles.includes(user.role);
        } else {
          console.log(error);
          throw new NotFoundException(error);
        }
      }
    }
    throw new HttpException(
      {
        status: HttpStatus.METHOD_NOT_ALLOWED,
      },
      HttpStatus.METHOD_NOT_ALLOWED,
    );
    return false;
  }
}
