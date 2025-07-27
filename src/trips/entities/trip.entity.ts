import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Truck } from '../../trucks/entities/truck.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Client } from '../../clients/entities/client.entity';

export enum TripStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('trips')
export class Trip {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  truckId: number;

  @ApiProperty()
  @Column()
  driverId: number;

  @ApiProperty()
  @Column()
  clientId: number;

  @ApiProperty()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @ApiProperty()
  @Column()
  origin: string;

  @ApiProperty()
  @Column()
  destination: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  revenue: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fuelCost: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  maintenanceCost: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  otherExpenses: number;

  @ApiProperty({ enum: TripStatus })
  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.PLANNED
  })
  status: TripStatus;

  @ManyToOne(() => Truck, truck => truck.trips)
  @JoinColumn({ name: 'truckId' })
  truck: Truck;

  @ManyToOne(() => Driver, driver => driver.trips)
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @ManyToOne(() => Client, client => client.trips)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}