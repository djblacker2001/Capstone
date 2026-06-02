import { ApiProperty } from '@nestjs/swagger';

export class CreateSignDto {
    @ApiProperty()
    SignId!: number;

    @ApiProperty()
    Symbol!: string;

    @ApiProperty()
    Image?: string;

    @ApiProperty()
    Description?: string;
}