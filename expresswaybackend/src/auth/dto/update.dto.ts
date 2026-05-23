import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiProperty()
  IsActive?: boolean;

  @ApiProperty()
  IsLocked?: boolean;

  @ApiProperty()
  Avatar?: string;

  @ApiProperty()
  Password?: string;

  @ApiProperty()
  Email?: string;
}