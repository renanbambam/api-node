import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Exclude } from 'class-transformer';

import { UserRoleEnum } from '../enums/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
    versionKey: false,
})
export class User {
    @Prop()
    id: string;

    @Prop()
    readonly name: string;

    @Prop({ unique: [true, 'Duplicated email'] })
    readonly email: string;

    @Prop()
    @Exclude()
    readonly password: string;

    @Prop()
    readonly address: string;

    @Prop()
    readonly addressNumber: string;

    @Prop()
    readonly city: string;

    @Prop()
    readonly state: string;

    @Prop()
    readonly country: string;

    @Prop()
    readonly zipcode: string;

    @Prop()
    readonly avatar?: string;

    @Prop()
    readonly birthday: string;

    @Prop({ unique: [true, 'Duplicated document'] })
    readonly document: string;

    @Prop()
    readonly phone: string;

    @Prop()
    readonly roles: UserRoleEnum;

    @Prop()
    readonly company_id: string;

    @Prop()
    readonly branch_id: string | null;

    @Prop()
    readonly refresh_token: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
