import { ApiProperty } from '@nestjs/swagger';

export class CreateSignDto {
    @ApiProperty()
    SignId!: number;

    @ApiProperty()
    Symbol!: string;

    @ApiProperty({ type: 'string', format: 'binary'})
    file?: any;

    @ApiProperty()
    Description?: string;
}