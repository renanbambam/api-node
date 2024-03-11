import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Throttle } from '@nestjs/throttler';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { AuthRequest } from 'src/auth/models/AuthRequest';
import { Company, CompanyDocument } from './entities/company.entity';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ApiBodyCompany } from 'src/auth/decorators/api-body-company.decorator';

@Controller('company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    name = {
        name: 'ms',
    };
    async onModuleInit() {
        const company = await this.findCompanyByName(this.name);
        if (!company) {
            this.createCompany({
                name: 'ms',
                email: 'mscompany@ms.com.br',
                avatar: null,
                address: 'rua teste',
                addressNumber: '333',
                city: 'belo horizonte',
                state: 'mg',
                country: 'brasil',
                zipcode: '31300-000',
                document: '00.000.000/0000-00',
                phone: '31 9 9999-9999',
            });
        }
    }

    @Throttle(1, 10)
    @Get()
    findMyCompany(@Req() req: AuthRequest): Promise<CompanyDocument> {
        return this.companyService.findMyCompany(req);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN)
    @Get('all')
    findAllCompanies(@Req() req: AuthRequest): Promise<CompanyDto[]> {
        return this.companyService.findAllCompanies(req);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN)
    @Get('name')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                },
            },
        },
    })
    findCompanyByName(@Body() companyDto: object): Promise<Company> {
        return this.companyService.findCompanyByName(companyDto);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN)
    @Get(':id')
    findCompanyById(@Param('id') id: string): Promise<CompanyDto> {
        return this.companyService.findCompanyById(id);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN)
    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiBodyCompany([
        'name',
        'email',
        'address',
        'addresNumber',
        'city',
        'state',
        'country',
        'zipcode',
        'avatar',
        'document',
        'phone',
    ])
    createCompany(@Body() companyDto: CompanyDto): Promise<Company> {
        return this.companyService.createCompany(companyDto);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
    @Patch()
    @ApiConsumes('multipart/form-data')
    @ApiBodyCompany()
    updateCompany(@Req() req: AuthRequest, @Body() updateCompanyDto: UpdateCompanyDto): Promise<Company> {
        return this.companyService.updateCompany(req, updateCompanyDto);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN)
    @Delete()
    removeCompany(@Req() req: AuthRequest): Promise<{ message: string }> {
        return this.companyService.removeCompany(req);
    }
}
