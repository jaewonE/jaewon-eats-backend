import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const getUserIdFromReq = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const userId =
      GqlExecutionContext.create(context).getContext().req['userId'];
    return Number(userId);
  },
);
