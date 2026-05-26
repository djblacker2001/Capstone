import { ApiProperty } from "@nestjs/swagger";

export class CreateRestStopDto {
    @ApiProperty()
    RestStopId!: number;

    @ApiProperty()
    SectionId!: number;

    @ApiProperty()
    NameRestStop!: string;

    @ApiProperty()
    Location?: string;

    @ApiProperty()
    HasPetrol!: boolean;

    @ApiProperty()
    HasFood!: boolean;

    @ApiProperty()
    HasToilet!: boolean;

    @ApiProperty()
    Status?: string;
}