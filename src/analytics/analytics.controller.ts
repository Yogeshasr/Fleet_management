import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('fleet-overview')
  @ApiOperation({ summary: 'Get fleet overview analytics' })
  @ApiResponse({ status: 200, description: 'Fleet overview analytics retrieved successfully' })
  getFleetOverview() {
    return this.analyticsService.getFleetUtilization();
  }

  @Get('performance-metrics')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for metrics' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for metrics' })
  getPerformanceMetrics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getPerformanceMetrics(start, end);
  }

  @Get('revenue-analysis')
  @ApiOperation({ summary: 'Get revenue analysis' })
  @ApiResponse({ status: 200, description: 'Revenue analysis retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analysis' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analysis' })
  getRevenueAnalysis(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getRevenueAnalytics(start, end);
  }

  @Get('efficiency-trends')
  @ApiOperation({ summary: 'Get efficiency trends' })
  @ApiResponse({ status: 200, description: 'Efficiency trends retrieved successfully' })
  getEfficiencyTrends() {
    return this.analyticsService.getAdvancedKPIs();
  }

  @Get('predictive-analytics')
  @ApiOperation({ summary: 'Get predictive analytics' })
  @ApiResponse({ status: 200, description: 'Predictive analytics retrieved successfully' })
  getPredictiveAnalytics() {
    return this.analyticsService.getPredictiveAnalytics();
  }

  @Get('realtime-dashboard')
  @ApiOperation({ summary: 'Get realtime dashboard data' })
  @ApiResponse({ status: 200, description: 'Realtime dashboard data retrieved successfully' })
  getRealtimeDashboard() {
    return this.analyticsService.getRealtimeDashboard();
  }
}