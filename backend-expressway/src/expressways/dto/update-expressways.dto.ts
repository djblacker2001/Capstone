import { PartialType } from '@nestjs/swagger';
import { CreateExpresswayDto } from './create-expressways.dto';

export class UpdateExpresswayDto extends PartialType(CreateExpresswayDto) {}