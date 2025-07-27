import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Trip, TripStatus } from '../trips/entities/trip.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Check if client with same email already exists
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email }
    });

    if (existingClient) {
      throw new ConflictException('Client with this email already exists');
    }

    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      relations: ['trips'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['trips']
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    // Check email uniqueness if email is being updated
    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existingClient = await this.clientRepository.findOne({
        where: { email: updateClientDto.email }
      });

      if (existingClient) {
        throw new ConflictException('Client with this email already exists');
      }
    }

    await this.clientRepository.update(id, updateClientDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const client = await this.findOne(id);

    // Check if client has active trips
    if (client.trips && client.trips.length > 0) {
      const activeTrips = client.trips.filter(trip => 
        trip.status === TripStatus.IN_PROGRESS || trip.status === TripStatus.PLANNED
      );

      if (activeTrips.length > 0) {
        throw new BadRequestException('Cannot delete client with active trips');
      }
    }

    await this.clientRepository.remove(client);
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { email },
      relations: ['trips']
    });
  }

  async searchClients(searchTerm: string): Promise<Client[]> {
    return this.clientRepository
      .createQueryBuilder('client')
      .where('client.name ILIKE :searchTerm OR client.email ILIKE :searchTerm OR client.company ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`
      })
      .getMany();
  }

  async getClientStatistics() {
    const [total, withActiveTrips] = await Promise.all([
      this.clientRepository.count(),
      this.clientRepository
        .createQueryBuilder('client')
        .leftJoin('client.trips', 'trip')
        .where('trip.status IN (:...statuses)', { statuses: ['IN_PROGRESS', 'PLANNED'] })
        .getCount()
    ]);

    return {
      total,
      withActiveTrips,
      inactive: total - withActiveTrips
    };
  }
}