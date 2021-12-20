import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class adminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext.req['user'];
    if (!user) {
      return false;
    }
    if (user.email === 'jaewone@email.com') {
      return true;
    } else {
      return false;
    }
  }
}
