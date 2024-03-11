import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthRequest } from './../models/AuthRequest';
import { UserRoleEnum } from './../../user/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles: UserRoleEnum[] = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthRequest>();
        const user = request.user;

        if (user && roles.some((role) => role === user.roles)) {
            return true;
        }
        throw new UnauthorizedException(`User must be ${roles.join(' or ')}`);
    }
}
