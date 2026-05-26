import { ApiProperty } from "@nestjs/swagger";

export class CreateProvinceDto {
  @ApiProperty()
  ProvinceId!: number;

  @ApiProperty()
  ProvinceName!: string;

  @ApiProperty()
  Region!: string;
}