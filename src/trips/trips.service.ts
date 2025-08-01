import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Trip, TripStatus } from "./entities/trip.entity";
import { Truck, TruckStatus } from "../trucks/entities/truck.entity";
import { Driver, DriverStatus } from "../drivers/entities/driver.entity";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Truck)
    private truckRepository: Repository<Truck>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>
  ) {}

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    // Validate that truck is available
    const truck = await this.truckRepository.findOne({
      where: { id: createTripDto.truckId },
    });
    if (!truck) {
      throw new NotFoundException("Truck not found");
    }
    if (truck.status !== TruckStatus.AVAILABLE) {
      throw new BadRequestException("Truck is not available");
    }

    // Validate that driver is available
    const driver = await this.driverRepository.findOne({
      where: { id: createTripDto.driverId },
    });
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }
    if (driver.status !== DriverStatus.ACTIVE) {
      throw new BadRequestException("Driver is not available");
    }

    const trip = this.tripRepository.create(createTripDto);
    const savedTrip = await this.tripRepository.save(trip);

    // Update truck status to in-use
    await this.truckRepository.update(createTripDto.truckId, {
      status: TruckStatus.IN_USE,
    });

    await this.driverRepository.update(createTripDto.driverId, {
      status: DriverStatus.BUSY,
    });

    return this.findOne(savedTrip.id);
  }

  async findAll(filters?: {
    status?: string;
    driverId?: number;
    truckId?: number;
  }): Promise<Trip[]> {
    const query = this.tripRepository
      .createQueryBuilder("trip")
      .leftJoinAndSelect("trip.truck", "truck")
      .leftJoinAndSelect("trip.driver", "driver")
      .leftJoinAndSelect("trip.client", "client")
      .orderBy("trip.createdAt", "DESC");

    if (filters?.status) {
      query.andWhere("trip.status = :status", { status: filters.status });
    }

    if (filters?.driverId) {
      query.andWhere("trip.driverId = :driverId", {
        driverId: filters.driverId,
      });
    }

    if (filters?.truckId) {
      query.andWhere("trip.truckId = :truckId", { truckId: filters.truckId });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ["truck", "driver", "client"],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async update(id: number, updateTripDto: UpdateTripDto): Promise<Trip> {
    const trip = await this.findOne(id);

    // Validate status transitions
    if (
      updateTripDto.status &&
      !this.isValidStatusTransition(trip.status, updateTripDto.status)
    ) {
      throw new BadRequestException(
        `Invalid status transition from ${trip.status} to ${updateTripDto.status}`
      );
    }

    // If completing or cancelling trip, free up the truck
    if (
      updateTripDto.status === TripStatus.COMPLETED ||
      updateTripDto.status === TripStatus.CANCELLED
    ) {
      await this.truckRepository.update(trip.truck.id, {
        status: TruckStatus.AVAILABLE,
      });
    }

    await this.tripRepository.update(id, updateTripDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const trip = await this.findOne(id);

    if (trip.status === TripStatus.IN_PROGRESS) {
      throw new BadRequestException("Cannot delete a trip that is in progress");
    }

    // Free up the truck if it was assigned
    if (trip.truck && trip.status !== TripStatus.COMPLETED) {
      await this.truckRepository.update(trip.truck.id, {
        status: TruckStatus.AVAILABLE,
      });
    }

    await this.tripRepository.remove(trip);
  }

  private isValidStatusTransition(
    currentStatus: TripStatus,
    newStatus: TripStatus
  ): boolean {
    const validTransitions = {
      [TripStatus.PLANNED]: [TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
      [TripStatus.IN_PROGRESS]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
      [TripStatus.COMPLETED]: [],
      [TripStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  async findByDriver(driverId: number): Promise<Trip[]> {
    return this.tripRepository.find({
      where: { driver: { id: driverId } },
      relations: ["truck", "driver", "client"],
      order: { createdAt: "DESC" },
    });
  }

  async findByTruck(truckId: number): Promise<Trip[]> {
    return this.tripRepository.find({
      where: { truck: { id: truckId } },
      relations: ["truck", "driver", "client"],
      order: { createdAt: "DESC" },
    });
  }

  async findActiveTrips(): Promise<Trip[]> {
    return this.tripRepository.find({
      where: { status: TripStatus.IN_PROGRESS },
      relations: ["truck", "driver", "client"],
    });
  }

  async getActiveTrips(): Promise<Trip[]> {
    return this.findActiveTrips();
  }

  async getStatistics() {
    return this.getTripStatistics();
  }

  async getTripsByDriver(driverId: number): Promise<Trip[]> {
    return this.findByDriver(driverId);
  }

  async getTripsByTruck(truckId: number): Promise<Trip[]> {
    return this.findByTruck(truckId);
  }

  async getTripStatistics() {
    const [total, completed, inProgress, cancelled] = await Promise.all([
      this.tripRepository.count(),
      this.tripRepository.count({ where: { status: TripStatus.COMPLETED } }),
      this.tripRepository.count({ where: { status: TripStatus.IN_PROGRESS } }),
      this.tripRepository.count({ where: { status: TripStatus.CANCELLED } }),
    ]);

    return {
      total,
      completed,
      inProgress,
      cancelled,
      planned: total - completed - inProgress - cancelled,
    };
  }

  async getFilteredTrips(filters: any) {
    const query = this.tripRepository
      .createQueryBuilder("trip")
      .leftJoinAndSelect("trip.truck", "truck")
      .leftJoinAndSelect("trip.driver", "driver");

    if (filters.status) {
      query.andWhere("trip.status = :status", { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere("trip.startDate >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere("trip.endDate <= :endDate", { endDate: filters.endDate });
    }

    return query.getMany();
  }

  async startTrip(id: number) {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ["truck", "driver"],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    if (trip.status !== TripStatus.PLANNED) {
      throw new BadRequestException(
        "Trip can only be started if it is in PLANNED status"
      );
    }

    trip.status = TripStatus.IN_PROGRESS;
    trip.startDate = new Date();

    await this.tripRepository.save(trip);
    return trip;
  }

  async completeTrip(id: number) {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ["truck", "driver"],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "Trip can only be completed if it is in IN_PROGRESS status"
      );
    }

    trip.status = TripStatus.COMPLETED;
    trip.endDate = new Date();

    // Update truck status back to available
    await this.truckRepository.update(trip.truck.id, {
      status: TruckStatus.AVAILABLE,
    });

    await this.tripRepository.save(trip);
    return trip;
  }
}
