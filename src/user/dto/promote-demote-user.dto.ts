import { IsNotEmpty, IsString, IsEmail, IsEnum } from 'class-validator';
import { UserRoleEnum } from '../enums/user-role.enum';

export class PromoteOrDemoteUser {
    @IsNotEmpty()
    @IsString()
    @IsEmail({}, { message: 'Please enter valid email' })
    readonly email: string;

    @IsNotEmpty()
    @IsEnum(UserRoleEnum)
    readonly roles: UserRoleEnum;
}
