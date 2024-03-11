import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { MongooseError } from 'mongoose';

import { CompanyDto } from './dto/company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './entities/company.entity';
import { AuthRequest } from 'src/auth/models/AuthRequest';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { UserPayload } from 'src/auth/models/UserPayload';
import { validateOrReject } from 'class-validator';

@Injectable()
export class CompanyService {
    constructor(@InjectModel(Company.name) private companyModel: mongoose.Model<CompanyDocument>) {}
    public async findMyCompany(req: AuthRequest): Promise<CompanyDocument> {
        try {
            const userJwt: UserPayload = req.user;
            const companyId: string = userJwt.company_id;

            const company = await this.companyModel.findById(companyId);
            if (!company) {
                throw new Error(`No company found with ID ${companyId}`);
            }

            return company;
        } catch (error) {
            if (error instanceof MongooseError) {
                throw new MongooseError(`${error.message}`);
            }
            throw new Error('Failed to find company');
        }
    }

    async findAllCompanies(req: AuthRequest, limit = 10, page = 1): Promise<Company[]> {
        if (req.user.roles !== UserRoleEnum.SUPER_ADMIN) {
            throw new UnauthorizedException('you can not access this endpoint');
        }

        const skip = (page - 1) * limit;

        const companies: Company[] = await this.companyModel.find().skip(skip).limit(limit);

        return companies;
    }

    async findCompanyById(id: string): Promise<Company> {
        const company: Company = await this.companyModel.findById(id);

        return company;
    }

    async findCompanyByName(companyName: object): Promise<Company> {
        const company: Company = await this.companyModel.findOne(companyName);

        return company;
    }

    async createCompany(companyDto: CompanyDto): Promise<Company> {
        const newCompany = new Company();
        Object.assign(newCompany, companyDto);
        newCompany.name = newCompany.name.toLowerCase();

        try {
            await validateOrReject(newCompany);
            const createdCompany = await this.companyModel.create(newCompany);
            return this.findCompanyById(createdCompany.id);
        } catch (error) {
            if (error instanceof Array && error[0] instanceof Error) {
                throw new BadRequestException(error[0].message);
            }
            throw new BadRequestException('Invalid data provided');
        }
    }

    async updateCompany(req: AuthRequest, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
        if (req.user.roles === UserRoleEnum.SUPER_ADMIN) {
            const company: Company = await this.companyModel.findOneAndUpdate(
                { name: updateCompanyDto.name },
                updateCompanyDto,
                {
                    new: true,
                    returnOriginal: false,
                    returnDocument: 'after',
                }
            );

            return company;
        } else if (req.user.roles === UserRoleEnum.ADMIN) {
            const company: Company = await this.companyModel.findByIdAndUpdate(req.user.company_id, updateCompanyDto, {
                new: true,
                returnOriginal: false,
                returnDocument: 'after',
            });

            return company;
        }
    }

    async removeCompany(req: AuthRequest): Promise<{ message: string }> {
        const commpany = await this.companyModel.findByIdAndRemove(req.user.company_id);
        if (!commpany) {
            throw new UnauthorizedException('Could not remove company');
        }

        return {
            message: 'company successfully removed',
        };
    }
}
