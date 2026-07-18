import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @ApiProperty()
  @MinLength(6, { 
    message: i18nValidationMessage('validation.PASSWORD_MIN_LENGTH') 
  })
  newPassword!: string;
}