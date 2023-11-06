import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserAndRefreshToken = createParamDecorator(
  (data: undefined | string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
