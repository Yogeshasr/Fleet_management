import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trips' })
  @ApiResponse({ status: 200, description: 'Trips retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by trip status' })
  @ApiQuery({ name: 'driverId', required: false, description: 'Filter by driver ID' })
  @ApiQuery({ name: 'truckId', required: false, description: 'Filter by truck ID' })
  findAll(@Query('status') status?: string, @Query('driverId') driverId?: string, @Query('truckId') truckId?: string) {
    const filters = {
      status,
      driverId: driverId ? +driverId : undefined,
      truckId: truckId ? +truckId : undefined
    };
    return this.tripsService.findAll(filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get trip statistics' })
  @ApiResponse({ status: 200, description: 'Trip statistics retrieved successfully' })
  getStatistics() {
    return this.tripsService.getStatistics();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active trips' })
  @ApiResponse({ status: 200, description: 'Active trips retrieved successfully' })
  getActiveTrips() {
    return this.tripsService.getActiveTrips();
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get trips by driver' })
  @ApiResponse({ status: 200, description: 'Driver trips retrieved successfully' })
  getTripsByDriver(@Param('driverId') driverId: string) {
    return this.tripsService.getTripsByDriver(+driverId);
  }

  @Get('truck/:truckId')
  @ApiOperation({ summary: 'Get trips by truck' })
  @ApiResponse({ status: 200, description: 'Truck trips retrieved successfully' })
  getTripsByTruck(@Param('truckId') truckId: string) {
    return this.tripsService.getTripsByTruck(+truckId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  @ApiResponse({ status: 200, description: 'Trip retrieved successfully' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip' })
  @ApiResponse({ status: 200, description: 'Trip updated successfully' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(+id, updateTripDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trip' })
  @ApiResponse({ status: 200, description: 'Trip deleted successfully' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  remove(@Param('id') id: string) {
    return this.tripsService.remove(+id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a trip' })
  @ApiResponse({ status: 200, description: 'Trip started successfully' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  startTrip(@Param('id') id: string) {
    return this.tripsService.startTrip(+id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a trip' })
  @ApiResponse({ status: 200, description: 'Trip completed successfully' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  completeTrip(@Param('id') id: string) {
    return this.tripsService.completeTrip(+id);
  }
}