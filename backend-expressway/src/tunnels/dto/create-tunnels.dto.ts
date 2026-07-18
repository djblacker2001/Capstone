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
    HasLighting!: boolean;
}