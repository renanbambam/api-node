import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({
    versionKey: false,
})
export class Company {
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
    document: string;

    @Prop()
    phone: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
