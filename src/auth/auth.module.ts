import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { LoginValidationMiddleware } from './middlewares/login-validation.middleware';
import { UserService } from './../user/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSchema } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { RtStrategy } from './strategies/refresh.startegy';

@Module({
    imports: [
        forwardRef(() => UserModule),
        PassportModule.register({ defaultStrategy: 'jwt', session: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserService, RtStrategy],
    exports: [JwtStrategy, PassportModule, UserService, AuthService],
})
export class AuthModule implements NestModule {
    configure(cosumer: MiddlewareConsumer) {
        cosumer.apply(LoginValidationMiddleware).forRoutes('auth/login');
    }
}
