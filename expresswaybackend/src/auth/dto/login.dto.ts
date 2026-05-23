import { ApiProperty } from "@nestjs/swagger";
import { MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty()
  Username!: string;

  @ApiProperty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  Password!: string;
}