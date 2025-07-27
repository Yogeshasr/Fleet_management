
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver, DriverStatus } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const existingDriver = await this.driverRepository.findOne({
      where: { licenseNumber: createDriverDto.licenseNumber }
    });

    if (existingDriver) {
      throw new ConflictException('Driver with this license number already exists');
    }

    const driver = this.driverRepository.create(createDriverDto);
    return this.driverRepository.save(driver);
  }

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find({
      relations: ['trips'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: ['trips']
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async update(id: number, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);

    if (updateDriverDto.licenseNumber && updateDriverDto.licenseNumber !== driver.licenseNumber) {
      const existingDriver = await this.driverRepository.findOne({
        where: { licenseNumber: updateDriverDto.licenseNumber }
      });

      if (existingDriver) {
        throw new ConflictException('Driver with this license number already exists');
      }
    }

    await this.driverRepository.update(id, updateDriverDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const driver = await this.findOne(id);
    await this.driverRepository.remove(driver);
  }

  async searchDrivers(searchTerm: string): Promise<Driver[]> {
    return this.driverRepository
      .createQueryBuilder('driver')
      .where('driver.name ILIKE :searchTerm OR driver.licenseNumber ILIKE :searchTerm OR driver.phone ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`
      })
      .getMany();
  }

  async getDriverStatistics() {
    const [total, active, onLeave, inactive] = await Promise.all([
      this.driverRepository.count(),
      this.driverRepository.count({ where: { status: DriverStatus.ACTIVE } }),
      this.driverRepository.count({ where: { status: DriverStatus.ON_LEAVE } }),
      this.driverRepository.count({ where: { status: DriverStatus.INACTIVE } })
    ]);

    return {
      total,
      active,
      onLeave,
      inactive,
      busy: total - active - onLeave - inactive
    };
  }

  async findAvailable(): Promise<Driver[]> {
    return this.driverRepository.find({
      where: { status: DriverStatus.ACTIVE }
    });
  }
}
