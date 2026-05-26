import { PartialType } from '@nestjs/swagger';
import { CreateProvinceDto } from './create-provinces.dto';

export class UpdateProvinceDto extends PartialType(CreateProvinceDto) {}