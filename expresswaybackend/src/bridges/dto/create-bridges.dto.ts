import { ApiProperty } from "@nestjs/swagger";

export class CreateBridgeDto {
    @ApiProperty()
    BridgeId!: number;

    @ApiProperty()
    SectionId!: number;

    @ApiProperty()
    NameBridge!: string;

    @ApiProperty()
    Length?: number;

    @ApiProperty()
    Type?: string;

    @ApiProperty()
    Overpass?: string;
}