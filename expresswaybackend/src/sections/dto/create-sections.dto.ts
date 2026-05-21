import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
    @ApiProperty()
    SectionId!: number;

    @ApiProperty()
    ExpresswayId!: number;

    @ApiProperty()
    NameSection!: string;

    @ApiProperty()
    Image?: string;

    @ApiProperty()
    Length!: number;

    @ApiProperty()
    StartLocation!: string;

    @ApiProperty()
    StartKm?: number;

    @ApiProperty()
    EndLocation!: string;

    @ApiProperty()
    EndKm?: number;

    @ApiProperty()
    SpeedLimit?: string;

    @ApiProperty()
    TrafficLand?: string;

    @ApiProperty()
    HasEmergencyLand?: boolean;

    @ApiProperty()
    Status?: string;

    @ApiProperty()
    MapData?: string;
}