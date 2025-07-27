
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Truck, TruckStatus } from './entities/truck.entity';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';

@Injectable()
export class TrucksService {
  constructor(
    @InjectRepository(Truck)
    private truckRepository: Repository<Truck>,
  ) {}

  async create(createTruckDto: CreateTruckDto): Promise<Truck> {
    const existingTruck = await this.truckRepository.findOne({
      where: { licensePlate: createTruckDto.licensePlate }
    });

    if (existingTruck) {
      throw new ConflictException('Truck with this license plate already exists');
    }

    const truck = this.truckRepository.create(createTruckDto);
    return this.truckRepository.save(truck);
  }

  async findAll(): Promise<Truck[]> {
    return this.truckRepository.find({
      relations: ['trips'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Truck> {
    const truck = await this.truckRepository.findOne({
      where: { id },
      relations: ['trips']
    });

    if (!truck) {
      throw new NotFoundException(`Truck with ID ${id} not found`);
    }

    return truck;
  }

  async update(id: number, updateTruckDto: UpdateTruckDto): Promise<Truck> {
    const truck = await this.findOne(id);

    if (updateTruckDto.licensePlate && updateTruckDto.licensePlate !== truck.licensePlate) {
      const existingTruck = await this.truckRepository.findOne({
        where: { licensePlate: updateTruckDto.licensePlate }
      });

      if (existingTruck) {
        throw new ConflictException('Truck with this license plate already exists');
      }
    }

    await this.truckRepository.update(id, updateTruckDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const truck = await this.findOne(id);
    await this.truckRepository.remove(truck);
  }

  async findAvailable(): Promise<Truck[]> {
    return this.truckRepository.find({
      where: { status: TruckStatus.AVAILABLE }
    });
  }
}
