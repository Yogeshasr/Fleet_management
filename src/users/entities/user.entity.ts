import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  VIEWER = 'viewer'
}

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'admin@example.com', description: 'Unique email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Encrypted password hash', writeOnly: true })
  @Column()
  password: string;

  @ApiProperty({ example: 'John Admin', description: 'Full name of the user' })
  @Column()
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN, description: 'User role and permissions level' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER
  })
  role: UserRole;

  @ApiProperty({ example: '2024-01-10T08:00:00Z', description: 'User account creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-10T08:30:00Z', description: 'User account last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ default: true })
  isActive: boolean;
}