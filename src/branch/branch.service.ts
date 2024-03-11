import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { MongooseError, SortOrder } from 'mongoose';

import { AuthRequest } from 'src/auth/models/AuthRequest';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { Branch, BranchDocument } from './entities/branch.entity';
import { BranchDto } from './dto/branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BranchService {
    constructor(@InjectModel(Branch.name) private branchModel: mongoose.Model<BranchDocument>) {}

    public async findMyBranch(req: AuthRequest): Promise<BranchDocument> {
        if (!req || !req.user || !req.user.company_id) {
            throw new BadRequestException('Invalid request object');
        }

        const branchId = req.user?.company_id;

        try {
            const branch = await this.branchModel.findById(branchId);

            if (!branch) {
                throw new NotFoundException('Branch not found');
            }

            return branch;
        } catch (error) {
            if (error instanceof MongooseError) {
                throw new MongooseError(`${error.message}`);
            }
            throw new InternalServerErrorException('Error finding branch', error);
        }
    }

    async findAllBranches(req: AuthRequest): Promise<Branch[]> {
        if (req.user.roles !== UserRoleEnum.SUPER_ADMIN) {
            throw new UnauthorizedException('You are not authorized to access this endpoint.');
        }

        const { page = 0, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;
        const skip = Number(page) * Number(limit);
        type SortOptions = any | { [key: string]: SortOrder | { $meta: 'textScore' } } | [string, SortOrder][];
        const sortOptions: SortOptions = { [String(sortBy)]: sortOrder };
        const branches: Branch[] = await this.branchModel.find().skip(skip).limit(Number(limit)).sort(sortOptions);

        return branches;
    }

    async findBranchByName(branchObject: object): Promise<Branch> {
        const branch: Branch = await this.branchModel.findOne(branchObject);

        return branch;
    }

    async findBranchById(id: string): Promise<Branch> {
        const branch: Branch = await this.branchModel.findById(id);

        return branch;
    }

    async createBranch(branchDto: BranchDto): Promise<Branch> {
        const newBranch: Branch = await this.branchModel.create({
            ...branchDto,
            name: branchDto.name.toLowerCase(),
        });
        const branch: Branch = await this.findBranchById(newBranch.id);
        return branch;
    }

    async updateBranch(req: AuthRequest, updateBranchDto: UpdateBranchDto): Promise<Branch> {
        const validRoles = [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN];
        const userRoles = req.user.roles.split(',').map((role) => {
            switch (role.trim().toUpperCase()) {
                case 'ADMIN':
                    return UserRoleEnum.ADMIN;
                case 'SUPER_ADMIN':
                    return UserRoleEnum.SUPER_ADMIN;
                default:
                    throw new BadRequestException(`Invalid role: ${role}`);
            }
        });

        const isAdmin = userRoles.some((role) => validRoles.includes(role));
        if (!isAdmin) {
            throw new ForbiddenException('You do not have permissions to update branches');
        }

        const errors = await validate(plainToClass(UpdateBranchDto, updateBranchDto));
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
        }

        const updatedBranch = await this.branchModel.findByIdAndUpdate(updateBranchDto.name, updateBranchDto, {
            new: true,
        });
        return updatedBranch;
    }

    async removeBranch(req: AuthRequest): Promise<{ message: string }> {
        try {
            const branch = await this.branchModel.findByIdAndRemove(req.user.branch_id);
            if (!branch) {
                throw new UnauthorizedException('Could not remove branch');
            }
            return {
                message: 'branch successfully removed',
            };
        } catch (error) {
            if (error instanceof MongooseError) {
                throw new MongooseError(`${error.message}`);
            }
            throw new InternalServerErrorException('Error while removing the branch');
        }
    }
}
