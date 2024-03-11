import { PartialType } from '@nestjs/swagger';
import { BranchDto } from './branch.dto';

export class UpdateBranchDto extends PartialType(BranchDto) {}
