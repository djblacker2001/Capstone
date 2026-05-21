import { ApiProperty } from '@nestjs/swagger';

export class CreateExpresswayDto {
  @ApiProperty()
  ExpresswayId!: number;

  @ApiProperty()
  NameExpressway!: string;

  @ApiProperty({ nullable: true })
  Symbol?: string;

  @ApiProperty({ nullable: true })
  StartPoint?: string;

  @ApiProperty({ nullable: true })
  EndPoint?: string;
}