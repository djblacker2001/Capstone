import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail, IsString, MinLength } from "class-validator";

//register.dto.ts
export class RegisterDto {
  @ApiProperty()
  Username!: string;

  @ApiProperty()
  Email!: string;

  @ApiProperty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  Password!: string;
  
  @ApiProperty()
  Role!: string;
}