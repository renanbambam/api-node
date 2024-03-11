import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserPayload } from '../models/UserPayload';

export const GetCurrentUser = createParamDecorator((data: keyof UserPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;

    return request.user[data];
});
