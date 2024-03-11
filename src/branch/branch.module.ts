import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { BranchSchema } from './entities/branch.entity';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Branch', schema: BranchSchema }])],
    controllers: [BranchController],
    providers: [BranchService],
})
export class BranchModule {}
