import { ForbiddenException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { UserPayload } from './models/UserPayload';
import { User, UserDocument } from '../user/entities/user.entity';
import { UserToken } from './models/UserToken';
import { UserService } from '../user/user.service';
import { LoginRequestBody } from './models/LoginRequestBody';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @Inject(forwardRef((): typeof JwtService => JwtService))
        private jwtService: JwtService,
        @Inject(forwardRef((): typeof UserService => UserService))
        private userService: UserService
    ) {}

    public async validateUser(email: string, password: string) {
        const user = (await this.userService.findByEmail(email)).toObject();
        if (user) {
            const validPassword = await bcrypt.compare(password, user.password);

            if (validPassword) {
                return {
                    ...user,
                    password: undefined,
                };
            }
            throw new ForbiddenException('password not valid');
        }
        throw new ForbiddenException('user not valid');
    }

    public async login(loginDto: LoginRequestBody): Promise<UserToken> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const tokens: UserToken = await this.generateTokens(user);

        await this.updateRefreshTokenHash(user._id.toHexString(), tokens.refresh_token);

        return tokens;
    }

    // public async logout(request: Request): Promise<{ message: string }> {
    //     const token: string = (request as any)?.get('authorization')?.replace('Bearer', '').trim();

    //     return {
    //         message: 'logged out successfull',
    //     };
    // }

    public async refreshToken(id: string, refresh_token: string): Promise<UserToken> {
        const user = await this.userModel.findById(id);

        if (!user || !user.refresh_token) throw new ForbiddenException('access denied');

        const refresh_tokenMatches: boolean = await bcrypt.compare(refresh_token, user.refresh_token);
        if (!refresh_tokenMatches) throw new ForbiddenException('token invalid');

        try {
            await this.jwtService.verify(refresh_token, {
                secret: process.env.RT_SECRET,
            });

            const tokens: UserToken = await this.generateTokens(user);

            await this.updateRefreshTokenHash(user._id.toHexString(), tokens.refresh_token);

            return tokens;
        } catch (err) {
            if (err && err.name) {
                switch (err.name) {
                    case 'JsonWebTokenError':
                        throw new UnauthorizedException('Assinatura Inválida');
                    case 'TokenExpiredError':
                        throw new UnauthorizedException('Token Expirado');
                }
            }
            throw new UnauthorizedException(err);
        }
    }

    /* --- Utility Functions --- */

    private async hashData(data: string): Promise<string> {
        return await bcrypt.hash(data, 10);
    }

    private async updateRefreshTokenHash(id: string, refresh_token: string): Promise<void> {
        const hashedRefresh: string = await this.hashData(refresh_token);
        await this.userModel.findOneAndUpdate(
            { _id: id },
            { refresh_token: hashedRefresh },
            {
                new: true,
                returnOriginal: false,
                returnDocument: 'after',
            }
        );
    }

    private async generateTokens(user): Promise<UserToken> {
        const payload: UserPayload = {
            sub: user._id.toHexString(),
            email: user.email,
            roles: user.roles,
            company_id: user.company_id,
            branch_id: user?.branch_id,
        };

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRE,
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.RT_SECRET,
                expiresIn: process.env.RT_EXPIRE,
            }),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }
}
