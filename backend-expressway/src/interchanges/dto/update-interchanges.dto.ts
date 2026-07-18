import { PartialType } from '@nestjs/swagger';
import { CreateInterchangeDto } from './create-interchanges.dto';

export class UpdateInterchangeDto extends PartialType(CreateInterchangeDto) {}