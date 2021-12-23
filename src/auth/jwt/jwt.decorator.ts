import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const getUserFromReq = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const user = GqlExecutionContext.create(context).getContext()['user'];
    if (user) {
      return user;
    } else {
      return null;
    }
  },
);

export const isAdmin = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const user = GqlExecutionContext.create(context).getContext()['user'];
    if (user) {
      return user['email'] === 'jaewone@email.com';
    } else {
      return false;
    }
  },
);
