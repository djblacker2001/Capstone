import { ApiProperty } from '@nestjs/swagger';

export class CreateExpresswayDto {
  @ApiProperty({required: false})
  NameExpressway?: string;

  @ApiProperty({ required: false })
  Symbol?: string;

  @ApiProperty({ required: false })
  Description?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false})
  MapData?: any;
}