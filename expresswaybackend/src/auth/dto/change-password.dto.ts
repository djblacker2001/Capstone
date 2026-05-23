import { ApiProperty } from "@nestjs/swagger";
import { MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  oldPassword!: string;

  @ApiProperty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword!: string;
}