import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty()
  Username!: string;

  @ApiProperty()
  @IsEmail()
  Email!: string;

  @ApiProperty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  Password!: string;
  
  @ApiProperty()
  Role!: string;
}