import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsStrongPassword,
    MinLength,
} from 'class-validator';

import { UserRoleEnum } from './../enums/user-role.enum';

export class UserDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail({}, { message: 'Please enter valid email' })
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @IsStrongPassword(
        {},
        {
            message: 'Please insert a strong password',
        }
    )
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    readonly address: string;

    @IsNotEmpty()
    @IsString()
    readonly addressNumber: string;

    @IsNotEmpty()
    @IsString()
    readonly city: string;

    @IsNotEmpty()
    @IsString()
    readonly state: string;

    @IsNotEmpty()
    @IsString()
    readonly country: string;

    @IsNotEmpty()
    @IsString()
    readonly zipcode: string;

    @IsOptional()
    readonly avatar: string;

    @IsDateString(
        {},
        {
            message: 'Please enter a valid date',
        }
    )
    @IsNotEmpty()
    @IsString()
    readonly birthday: string;

    @IsNotEmpty()
    @IsString()
    readonly document: string;

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber()
    readonly phone: string;

    @IsNotEmpty()
    @IsEnum(UserRoleEnum)
    readonly roles: UserRoleEnum;

    @IsNotEmpty()
    readonly company_id: string;

    @IsOptional()
    readonly branch_id: string | null;

    @IsOptional()
    readonly refresh_token: string | null;
}
