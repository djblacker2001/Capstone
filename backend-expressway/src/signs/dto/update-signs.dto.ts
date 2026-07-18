import { PartialType } from '@nestjs/swagger';
import { CreateSignDto } from './create-signs.dto';

export class UpdateSignDto extends PartialType(CreateSignDto) {}