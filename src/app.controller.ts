
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getHello(): string {
    return 'Fleet Management API is running!';
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health information' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
