import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({ status: 201, description: 'Driver created successfully', type: Driver })
  @ApiResponse({ status: 409, description: 'License number already exists' })
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drivers' })
  @ApiResponse({ status: 200, description: 'List of drivers', type: [Driver] })
  findAll() {
    return this.driversService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drivers' })
  @ApiResponse({ status: 200, description: 'List of available drivers', type: [Driver] })
  findAvailable() {
    return this.driversService.findAvailable();
  }

  @Get('search/:searchTerm')
  @ApiOperation({ summary: 'Search drivers' })
  @ApiResponse({ status: 200, description: 'Search results', type: [Driver] })
  searchDrivers(@Param('searchTerm') searchTerm: string) {
    return this.driversService.searchDrivers(searchTerm);
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: 'Get driver statistics' })
  @ApiResponse({ status: 200, description: 'Driver statistics' })
  getStatistics() {
    return this.driversService.getDriverStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiResponse({ status: 200, description: 'Driver found', type: Driver })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update driver' })
  @ApiResponse({ status: 200, description: 'Driver updated successfully', type: Driver })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(+id, updateDriverDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete driver' })
  @ApiResponse({ status: 200, description: 'Driver deleted successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  remove(@Param('id') id: string) {
    return this.driversService.remove(+id);
  }
}