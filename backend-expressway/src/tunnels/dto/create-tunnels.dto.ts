import { ApiProperty } from "@nestjs/swagger";

export class CreateTunnelDto {
    @ApiProperty()
    TunnelId!: number;

    @ApiProperty()
    SectionId!: number;

    @ApiProperty()
    NameTunnel!: string;

    @ApiProperty()
    Length!: number;

    @ApiProperty()
    Height!: number;

    @ApiProperty()
    Longitude?: number;

    @ApiProperty()
    Latitude?: number;

    @ApiProperty()
    MaxSpeed?: number;

    @ApiProperty()
    MinSpeed?: number;

    @ApiProperty()
    HasLighting!: boolean;
}