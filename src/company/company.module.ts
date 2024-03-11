import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanySchema } from './entities/company.entity';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema }])],
    controllers: [CompanyController],
    providers: [CompanyService],
    exports: [CompanyService],
})
export class CompanyModule {}
