import { PartialType } from '@nestjs/swagger';
import { CreateTunnelDto } from './create-tunnels.dto';

export class UpdateTunnelDto extends PartialType(CreateTunnelDto) {}