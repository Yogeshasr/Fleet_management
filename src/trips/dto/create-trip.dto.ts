import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '../entities/trip.entity';

export class CreateTripDto {
  @ApiProperty({ example: 'New York', description: 'Trip starting location' })
  @IsString()
  origin: string;

  @ApiProperty({ example: 'Los Angeles', description: 'Trip destination location' })
  @IsString()
  destination: string;

  @ApiProperty({ example: 2500.50, description: 'Distance in kilometers' })
  @IsNumber()
  distance: number;

  @ApiProperty({ example: 1500.00, description: 'Estimated cost for the trip' })
  @IsNumber()
  estimatedCost: number;

  @ApiProperty({ example: 1450.75, description: 'Actual cost of the trip', required: false })
  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @ApiProperty({ example: 500, description: 'Revenue of the trip', required: false })
  @IsNumber()
  revenue: number;

  @ApiProperty({ enum: TripStatus, example: TripStatus.PLANNED, description: 'Trip status', required: false })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @ApiProperty({ example: '2024-01-15T10:00:00Z', description: 'Planned start date and time', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-01-20T16:00:00Z', description: 'Planned end date and time', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 1, description: 'ID of the truck to assign to this trip' })
  @IsNumber()
  truckId: number;

  @ApiProperty({ example: 1, description: 'ID of the driver to assign to this trip' })
  @IsNumber()
  driverId: number;

  @ApiProperty({ example: 1, description: 'ID of the client to assign to this trip' })
  @IsNumber()
  clientId: number;
}