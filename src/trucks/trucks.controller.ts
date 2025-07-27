
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TrucksService } from './trucks.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { Truck } from './entities/truck.entity';

@ApiTags('trucks')
@Controller('trucks')
export class TrucksController {
  constructor(private readonly trucksService: TrucksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new truck' })
  @ApiResponse({ status: 201, description: 'Truck created successfully', type: Truck })
  @ApiResponse({ status: 409, description: 'License plate already exists' })
  create(@Body() createTruckDto: CreateTruckDto) {
    return this.trucksService.create(createTruckDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trucks' })
  @ApiResponse({ status: 200, description: 'List of trucks', type: [Truck] })
  findAll() {
    return this.trucksService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available trucks' })
  @ApiResponse({ status: 200, description: 'List of available trucks', type: [Truck] })
  findAvailable() {
    return this.trucksService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get truck by ID' })
  @ApiResponse({ status: 200, description: 'Truck found', type: Truck })
  @ApiResponse({ status: 404, description: 'Truck not found' })
  findOne(@Param('id') id: string) {
    return this.trucksService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update truck' })
  @ApiResponse({ status: 200, description: 'Truck updated successfully', type: Truck })
  @ApiResponse({ status: 404, description: 'Truck not found' })
  update(@Param('id') id: string, @Body() updateTruckDto: UpdateTruckDto) {
    return this.trucksService.update(+id, updateTruckDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete truck' })
  @ApiResponse({ status: 200, description: 'Truck deleted successfully' })
  @ApiResponse({ status: 404, description: 'Truck not found' })
  remove(@Param('id') id: string) {
    return this.trucksService.remove(+id);
  }
}
