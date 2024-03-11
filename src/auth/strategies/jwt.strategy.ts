import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { UserPayload } from './../models/UserPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }
    async validate(payload: UserPayload): Promise<UserPayload> {
        return {
            sub: payload.sub,
            email: payload.email,
            roles: payload.roles,
            company_id: payload.company_id,
            branch_id: payload.branch_id,
        };
    }
}
