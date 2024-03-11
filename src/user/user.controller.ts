import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    OnModuleInit,
    Req,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { UserService } from './user.service';
import { AuthRequest } from './../auth/models/AuthRequest';
import { UserDocument } from './entities/user.entity';
import { UserDto, UserUpdateDto } from './dto';
import { UserRoleEnum } from './enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { PromoteOrDemoteUser } from './dto/promote-demote-user.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { CompanyService } from 'src/company/company.service';
import { ApiFile } from 'src/auth/decorators/api-file.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Controller('user')
export class UserController implements OnModuleInit {
    constructor(private readonly userService: UserService, private readonly companyService: CompanyService) {}

    name = {
        name: 'ms',
    };
    role = {
        role: 'SUPER_ADMIN',
    };
    company = this.companyService.findCompanyByName(this.name);

    async onModuleInit() {
        const superAdmin = await this.findUserByRoles(this.role);
        if (!superAdmin) {
            this.createUser({
                name: 'SuperAdmin',
                email: 'superadmin@ms.com.br',
                password: '1234',
                address: 'rua teste',
                addressNumber: '333',
                city: 'belo horizonte',
                state: 'mg',
                country: 'brasil',
                zipcode: '31300-000',
                avatar: '',
                birthday: '29/11/2004',
                document: '000.000.000-00',
                phone: '31 9 9999-9999',
                roles: UserRoleEnum.SUPER_ADMIN,
                company_id: (await this.company).id.toString(),
                branch_id: null,
                refresh_token: null,
            });
        }
    }

    @Get()
    findMyUser(@Req() req: AuthRequest): Promise<UserDocument> {
        return this.userService.findMyUser(req);
    }

    @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @Get('all')
    findAllUsers(@Req() req: AuthRequest): Promise<UserDocument[]> {
        return this.userService.findAllUser(req);
    }

    @Throttle(6, 10)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @Post('promote-demote')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'roles'],
            properties: {
                email: {
                    type: 'string',
                },
                roles: {
                    type: 'string',
                },
            },
        },
    })
    promoteOrDemoteUser(@Req() req: AuthRequest, @Body() user: PromoteOrDemoteUser): object {
        return this.userService.promoteOrDemoteUser(req, user);
    }

    @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @Post('role')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['roles'],
            properties: {
                roles: {
                    type: 'string',
                },
            },
        },
    })
    findUserByRoles(@Body() roles: any): Promise<UserDocument[]> {
        return this.userService.findUserByRoles(roles);
    }

    @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @Get(':id')
    findUserById(@Param('id') id: string) {
        return this.userService.findUserById(id);
    }

    @IsPublic()
    @Throttle(1, 10)
    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiFile()
    @UseInterceptors(
        FileInterceptor('avatar', {
            dest: './uploads',
        })
    )
    createUser(
        @Body() userDto: UserDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: 200000 })],
            })
        )
        avatar?: Express.Multer.File
    ): Promise<UserDocument> {
        return this.userService.createUser(userDto, avatar.filename);
    }

    @Throttle(1, 10)
    @Patch()
    @ApiConsumes('multipart/form-data')
    @ApiFile()
    @UseInterceptors(
        FileInterceptor('avatar', {
            dest: './uploads',
        })
    )
    updateUser(@Req() req: AuthRequest, @Body() userUpdateDto: UserUpdateDto): Promise<UserDocument> {
        return this.userService.updateUser(req, userUpdateDto);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
    @Delete()
    removeUser(@Req() req: AuthRequest): object {
        return this.userService.removeUser(req);
    }
}
