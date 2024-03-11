import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CompanyDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail({}, { message: 'Please enter valid email' })
    email: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    addressNumber: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    state: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsString()
    zipcode: string;

    @IsString()
    @IsOptional()
    avatar: string;

    @IsNotEmpty()
    @IsString()
    document: string;

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber()
    phone: string;
}
