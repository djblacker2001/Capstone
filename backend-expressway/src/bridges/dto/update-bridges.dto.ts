import { PartialType } from '@nestjs/swagger';
import { CreateBridgeDto } from './create-bridges.dto';

export class UpdateBridgeDto extends PartialType(CreateBridgeDto) {}