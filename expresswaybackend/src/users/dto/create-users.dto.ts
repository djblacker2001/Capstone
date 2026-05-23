import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty()
    RoleId!: number;

    @ApiProperty()
    Username!: string;

    @ApiProperty()
    Email!: string;

    @ApiProperty()
    Password!: string;

    @ApiProperty()
    Role!: string;

    @ApiProperty()
    IsActive!: boolean;

    @ApiProperty()
    IsLocked!: boolean;

    @ApiProperty()
    Avatar?: string;
}