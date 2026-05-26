import { ApiProperty } from '@nestjs/swagger';

export class CreateSignDto {
    @ApiProperty()
    SignId!: number;

    @ApiProperty()
    Sympol!: string;

    @ApiProperty()
    Image?: string;

    @ApiProperty()
    Description?: string;
}