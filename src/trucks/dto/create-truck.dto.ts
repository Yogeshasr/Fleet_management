
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { TruckStatus } from '../entities/truck.entity';

export class CreateTruckDto {
  @ApiProperty({ example: 'ABC-123' })
  @IsString()
  licensePlate: string;

  @ApiProperty({ example: 'Volvo FH16' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2022 })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ enum: TruckStatus, example: TruckStatus.AVAILABLE })
  @IsEnum(TruckStatus)
  @IsOptional()
  status?: TruckStatus;

  @ApiProperty({ example: 15000.5 })
  @IsNumber()
  @IsOptional()
  totalMileage?: number;
}
