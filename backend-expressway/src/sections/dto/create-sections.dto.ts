import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
    @ApiProperty()
    SectionId!: number;

    @ApiProperty()
    ExpresswayId!: number;

    @ApiProperty()
    NameSection!: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false})
    Image?: any;

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

    @ApiProperty({ type: 'string', format: 'binary', required: false})
    SpeedSign?: any;

    @ApiProperty()
    SpeedLimit?: string;

    @ApiProperty()
    TrafficLand?: string;

    @ApiProperty()
    HasEmergencyLand?: boolean;

    @ApiProperty()
    Status?: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'File JSON dữ liệu bản đồ (.json)' })
    MapData?: any;
}