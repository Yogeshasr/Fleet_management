import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Trip } from '../../trips/entities/trip.entity';

@Entity('clients')
export class Client {
  @ApiProperty({ example: 1, description: 'Unique identifier for the client' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ABC Corporation', description: 'Client company or individual name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'contact@abc-corp.com', description: 'Unique email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: '+1-555-0123', description: 'Contact phone number' })
  @Column()
  phone: string;

  @ApiProperty({ example: '123 Business St, City, State 12345', description: 'Business address' })
  @Column()
  address: string;

  @OneToMany(() => Trip, trip => trip.client)
  trips: Trip[];

  @ApiProperty({ example: '2024-01-10T08:00:00Z', description: 'Client registration timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-10T08:30:00Z', description: 'Client last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}