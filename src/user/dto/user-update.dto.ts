import {
    IsDateString,
    IsEmail,
    IsPhoneNumber,
    IsString,
    IsStrongPassword,
    MinLength,
    IsOptional,
} from 'class-validator';

import { UserRoleEnum } from './../enums/user-role.enum';

export class UserUpdateDto {
    @IsOptional()
    @IsString()
    readonly name: string;

    @IsOptional()
    @IsString()
    @IsEmail({}, { message: 'Please enter valid email' })
    readonly email: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @IsStrongPassword(
        {},
        {
            message: 'Please insert a strong password',
        }
    )
    readonly password: string;

    @IsOptional()
    @IsString()
    readonly address: string;

    @IsOptional()
    @IsString()
    readonly addressNumber: string;

    @IsOptional()
    @IsString()
    readonly city: string;

    @IsOptional()
    @IsString()
    readonly state: string;

    @IsOptional()
    @IsString()
    readonly country: string;

    @IsOptional()
    @IsString()
    readonly zipcode: string;

    @IsDateString(
        {},
        {
            message: 'Please enter a valid date',
        }
    )
    @IsOptional()
    @IsString()
    readonly birthday: Date;

    @IsOptional()
    @IsString()
    readonly document: string;

    @IsOptional()
    @IsString()
    @IsPhoneNumber()
    readonly phone: string;

    @IsOptional()
    @IsString()
    readonly roles: UserRoleEnum;

    @IsOptional()
    readonly company_id: string;

    @IsOptional()
    readonly branch_id: string | null;
}
