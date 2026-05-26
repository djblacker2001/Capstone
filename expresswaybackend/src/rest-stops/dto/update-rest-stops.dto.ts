import { PartialType } from '@nestjs/swagger';
import { CreateRestStopDto } from './create-rest-stops.dto';

export class UpdateRestStopDto extends PartialType(CreateRestStopDto) {}