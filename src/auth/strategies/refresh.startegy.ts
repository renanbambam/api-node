import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ForbiddenException, Injectable } from '@nestjs/common';

import { UserPayload } from '../models/UserPayload';
import { AuthRequest } from '../models/AuthRequest';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.RT_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(req: AuthRequest, payload: UserPayload): Promise<UserPayload> {
        const refresh_token = req?.get('authorization')?.replace('Bearer', '').trim();

        if (!refresh_token) throw new ForbiddenException('Refresh token malformed');

        return {
            ...payload,
            refresh_token,
        };
    }
}
