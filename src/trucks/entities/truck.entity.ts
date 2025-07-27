import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Trip } from '../../trips/entities/trip.entity';

export enum TruckStatus {
  AVAILABLE = 'AVAILABLE',
  ACTIVE = 'ACTIVE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

@Entity('trucks')
export class Truck {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  licensePlate: string;

  @ApiProperty()
  @Column()
  model: string;

  @ApiProperty()
  @Column()
  year: number;

  @ApiProperty({ enum: TruckStatus })
  @Column({
    type: 'enum',
    enum: TruckStatus,
    default: TruckStatus.AVAILABLE
  })
  status: TruckStatus;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalMileage: number;

  @OneToMany(() => Trip, trip => trip.truck)
  trips: Trip[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}