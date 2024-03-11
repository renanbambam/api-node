import { JwtModule } from '@nestjs/jwt';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './../auth/auth.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSchema } from './entities/user.entity';
import { CompanyModule } from 'src/company/company.module';

@Module({
    imports: [
        forwardRef(() => JwtModule),
        forwardRef(() => AuthModule),
        CompanyModule,
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
