import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { IsPublic } from './decorators/is-public.decorator';
import { LoginRequestBody } from './models/LoginRequestBody';
import { RtGuard } from './guards/refresh-auth.guard';
import { UserToken } from './models/UserToken';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthRequest } from './models/AuthRequest';
import { UserPayload } from './models/UserPayload';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @IsPublic()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: {
                    type: 'string',
                },
                password: {
                    type: 'string',
                },
            },
        },
    })
    login(@Body() loginDto: LoginRequestBody): Promise<UserToken> {
        return this.authService.login(loginDto);
    }

    // @Post('logout')
    // @HttpCode(HttpStatus.OK)
    // @IsPublic()
    // logout(@Req() req: Request): Promise<{ message: string }> {
    //     return this.authService.logout(req);
    // }

    @IsPublic()
    @Post('refresh')
    // @UseGuards(RtGuard)
    @HttpCode(HttpStatus.OK)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['refresh_token'],
            properties: {
                refresh_token: {
                    type: 'string',
                },
            },
        },
    })
    refreshToken(@Body() body: any): Promise<UserToken> {
        const id = body['id'];
        const refresh = body['refreshToken'];
        console.log(refresh);
        return this.authService.refreshToken(id, refresh);
    }
}
