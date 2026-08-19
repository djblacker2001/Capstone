import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateSectionDto {
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

    @ApiProperty({required: false})
    StartKm?: number;

    @ApiProperty()
    EndLocation!: string;

    @ApiProperty({required: false})
    EndKm?: number;

    @ApiProperty({ type: 'string', format: 'binary', required: false})
    SpeedSign?: any;

    @ApiProperty({required: false})
    SpeedLimit?: string;

    @ApiProperty({required: false})
    TrafficLand?: number;

    @ApiProperty()
    HasEmergencyLand!: boolean;

    @ApiProperty({required: false})
    Status?: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false})
    MapData?: any;

    @ApiProperty({
        type: [Number],
        description: 'Danh sách ID các tỉnh thành đi qua',
        required: false,
    })
    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed.map(Number) : [Number(value)];
            } catch {
                return value.split(',').map((v) => Number(v.trim()));
            }
        }
        return Array.isArray(value) ? value.map(Number) : value;
    })
    provinceIds?: number[];
}