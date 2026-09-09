import { ApiProperty } from "@nestjs/swagger";

export class CreateInterchangeDto {
    @ApiProperty()
    InterchangeId!: number;

    @ApiProperty()
    SectionId!: number;

    @ApiProperty()
    NameInterchange!: string;

    @ApiProperty()
    Type?: string;

    @ApiProperty()
    Location?: string;

    @ApiProperty()
    Longitude?: number;

    @ApiProperty()
    Latitude?: number;

    @ApiProperty()
    BOT?: string;

    @ApiProperty()
    Connection?: string;

    @ApiProperty()
    Status?: string;
}