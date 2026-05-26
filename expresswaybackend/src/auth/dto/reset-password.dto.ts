import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @MinLength(6)
  newPassword!: string;
}