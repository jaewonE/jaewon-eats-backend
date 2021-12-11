import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class IsUserIdInReq implements CanActivate {
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext.req['user'];
    return user ? true : false;
  }
}
