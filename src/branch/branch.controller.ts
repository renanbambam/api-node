import { ApiConsumes } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { AuthRequest } from 'src/auth/models/AuthRequest';
import { BranchService } from './branch.service';
import { BranchDto } from './dto/branch.dto';
import { Branch, BranchDocument } from './entities/branch.entity';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ApiBodyBranch } from 'src/auth/decorators/api-body-branch.decorator';

@Controller('branch')
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Throttle(1, 10)
    @Get()
    findMyBranch(@Req() req: AuthRequest): Promise<BranchDocument> {
        return this.branchService.findMyBranch(req);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
    @Get('all')
    findAllBranch(@Req() req: AuthRequest): Promise<Branch[]> {
        return this.branchService.findAllBranches(req);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
    @Get('name')
    findBranchByName(@Body() branchDto: object): Promise<Branch> {
        return this.branchService.findBranchByName(branchDto);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
    @Get(':id')
    findBranchById(@Param('id') id: string): Promise<Branch> {
        return this.branchService.findBranchById(id);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiBodyBranch([
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
        'company_id',
    ])
    createBranch(@Body() branchDto: BranchDto): Promise<Branch> {
        return this.branchService.createBranch(branchDto);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
    @Patch()
    @ApiConsumes('multipart/form-data')
    @ApiBodyBranch()
    updateBranch(@Req() req: AuthRequest, @Body() updateBranchDto: UpdateBranchDto): Promise<Branch> {
        return this.branchService.updateBranch(req, updateBranchDto);
    }

    @Throttle(1, 10)
    @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
    @Delete()
    removeBranch(@Req() req: AuthRequest): Promise<{ message: string }> {
        return this.branchService.removeBranch(req);
    }
}
