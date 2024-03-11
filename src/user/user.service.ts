import { Injectable, Scope, UnauthorizedException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { REQUEST } from '@nestjs/core';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { UserPayload } from './../auth/models/UserPayload';
import { AuthRequest } from './../auth/models/AuthRequest';
import { UserDto, UserUpdateDto } from './dto';
import { UserRoleEnum } from './enums/user-role.enum';
import { User, UserDocument } from './entities/user.entity';
import { PromoteOrDemoteUser } from './dto/promote-demote-user.dto';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: mongoose.Model<UserDocument>,
        @Inject(REQUEST) private readonly request: AuthRequest
    ) {}

    public async findMyUser(req: AuthRequest): Promise<UserDocument> {
        const userJwt: UserPayload = req.user;
        const userId: string = userJwt.sub;
        if (req.user.roles && ['CUSTOMER', 'USER'].some((role) => req.user.roles.includes(role))) {
            return await this.userModel.findById(userId).select('-password -refresh_token -roles');
        }

        return await this.userModel.findById(userId).select('-password -refresh_token');
    }

    public async findAllUser(req: AuthRequest): Promise<UserDocument[]> {
        const userJwt: UserPayload = (await req).user;
        const userId: string = userJwt.sub;
        const userReq = await this.findUserById(userId);
        const userRole: string = userJwt.roles;

        if (userRole === UserRoleEnum.SUPER_ADMIN) {
            return await this.userModel.find().select('-password -refresh_token');
        }
        if (userRole === UserRoleEnum.ADMIN) {
            return await this.userModel
                .find({
                    company: userReq.company_id,
                    roles: [UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN],
                })
                .select('-password -refresh_token');
        }
        if (userRole === UserRoleEnum.MANAGER) {
            return await this.userModel
                .find({
                    company: userReq.company_id,
                    roles: [UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.CUSTOMER],
                })
                .select('-password -refresh_token -roles');
        }

        return await this.userModel.find({ company: userReq.company_id }).select('-password -refresh_token -roles');
    }

    public async findUserById(id: string): Promise<UserDocument> {
        return await this.userModel.findById(id).select('-password -refresh_token -roles');
    }

    public async findUserByRoles(role: any): Promise<UserDocument[] | null> {
        const user = this.request.user;

        if (Object.keys(user).length === 0) {
            return await this.userModel.find({ roles: role.role });
        }

        const authorizedRoles = [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER];

        switch (role.role) {
            case UserRoleEnum.USER:
            case UserRoleEnum.CUSTOMER:
            case UserRoleEnum.MANAGER:
                if (this.isAuthorized(user, authorizedRoles)) break;
            case UserRoleEnum.ADMIN:
                if (this.isAuthorized(user, [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN])) break;
            case UserRoleEnum.SUPER_ADMIN:
                if (this.isAuthorized(user, [UserRoleEnum.SUPER_ADMIN])) break;
            default:
                throw new UnauthorizedException(`Invalid role "${role.role}"`);
        }

        try {
            const users = await this.userModel.find({ roles: role.role });
            return users;
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    public async createUser(userDto: UserDto, avatar: string): Promise<UserDocument> {
        const authorizedRoles = [UserRoleEnum.USER, UserRoleEnum.CUSTOMER];

        if (!authorizedRoles.includes(userDto.roles)) {
            throw new UnauthorizedException('you do not have permissons to create this kind of user');
        }

        const newUser = await this.userModel.create({
            ...userDto,
            password: await bcrypt.hash(userDto.password, 10),
            avatar: avatar,
        });
        const userId: string = (await newUser)._id.toHexString();
        const user = this.findUserById(userId);

        return user;
    }

    public async updateUser(request: AuthRequest, updateDto: UserUpdateDto): Promise<UserDocument> {
        const id: string = request.user.sub;
        const currentUser: UserDocument = await this.findUserById(id);
        const pass = updateDto.password ? { password: await bcrypt.hash(updateDto.password, 10) } : {};

        const unauthorizedRolesMap = {
            [UserRoleEnum.SUPER_ADMIN]: [],
            [UserRoleEnum.ADMIN]: [UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.CUSTOMER],
            [UserRoleEnum.MANAGER]: [UserRoleEnum.USER, UserRoleEnum.CUSTOMER],
        };

        const currentUserRole: UserRoleEnum = currentUser.roles;

        if (
            unauthorizedRolesMap.hasOwnProperty(updateDto.roles) &&
            unauthorizedRolesMap[updateDto.roles].includes(currentUserRole)
        ) {
            throw new UnauthorizedException(
                `You do not have permissions to create a user with role "${updateDto.roles}".`
            );
        }

        const updatedUser: UserDocument = await this.userModel
            .findByIdAndUpdate(
                id,
                { ...updateDto, ...pass },
                { new: true, returnOriginal: false, returnDocument: 'after' }
            )
            .exec();

        if (!updatedUser) {
            throw new Error('Could not update profile');
        }

        return updatedUser;
    }

    public async removeUser(req: AuthRequest): Promise<object> {
        const id: string = req.user.sub;
        const user = await this.userModel.findByIdAndRemove(id);
        if (!user) {
            throw new UnauthorizedException('Could not remove profile');
        }

        return {
            message: 'profile successfully removed',
        };
    }

    public async promoteOrDemoteUser(req: AuthRequest, user: PromoteOrDemoteUser) {
        if (!user) {
            throw new ForbiddenException('user invalid');
        } else if (req.user.roles === UserRoleEnum.ADMIN) {
            if (user.roles === UserRoleEnum.SUPER_ADMIN) {
                throw new UnauthorizedException('you do not have permison');
            }
        }

        await this.userModel.findOneAndUpdate({ email: user.email }, { roles: user.roles });

        return await this.userModel.find({ email: user.email }).select('-password -refresh_token');
    }

    /* --- Utility Functions --- */

    public async findByEmail(email: string) {
        return await this.userModel.findOne({ email: email }).select('-refresh_token');
    }

    public isAuthorized(user: any, allowedRoles: UserRoleEnum[]): boolean {
        return allowedRoles.includes(user.roles);
    }
}
