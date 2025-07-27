import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Trip } from '../../trips/entities/trip.entity';

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  BUSY = 'BUSY',
}

@Entity('drivers')
export class Driver {
  @ApiProperty({ example: 1, description: 'Unique identifier for the driver' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the driver' })
  @Column()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Unique email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: '+1-555-0123', description: 'Contact phone number' })
  @Column()
  phone: string;

  @ApiProperty({ example: 'DL123456789', description: 'Driver license number' })
  @Column()
  licenseNumber: string;

  @ApiProperty({ enum: DriverStatus })
  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.ACTIVE
  })
  status: DriverStatus;

  @ApiProperty({ example: true, description: 'Whether the driver is currently available for trips' })
  @Column({ default: true })
  isAvailable: boolean;

  @ApiProperty({ type: () => [Trip], description: 'List of trips assigned to this driver', required: false })
  @OneToMany(() => Trip, trip => trip.driver)
  trips: Trip[];

  @ApiProperty({ example: '2024-01-10T08:00:00Z', description: 'Driver registration timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-10T08:30:00Z', description: 'Driver last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}