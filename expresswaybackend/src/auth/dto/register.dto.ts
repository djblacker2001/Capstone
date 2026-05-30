import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class RegisterDto {
  @ApiProperty()
  Username!: string;

  @ApiProperty()
  @IsEmail()
  Email!: string;

  @ApiProperty()
  @MinLength(6, { 
    message: i18nValidationMessage('validation.PASSWORD_MIN_LENGTH') 
  })
  Password!: string;
  
  @ApiProperty()
  Role!: string;
}