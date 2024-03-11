import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BranchDocument = HydratedDocument<Branch>;

@Schema({
    versionKey: false,
})
export class Branch {
    @Prop()
    id: string;

    @Prop()
    name: string;

    @Prop({ unique: [true, 'Duplicated email'] })
    email: string;

    @Prop()
    address: string;

    @Prop()
    addressNumber: string;

    @Prop()
    city: string;

    @Prop()
    state: string;

    @Prop()
    country: string;

    @Prop()
    zipcode: string;

    @Prop()
    avatar: string;

    @Prop()
    company_id: string;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
