import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ReportsService } from "./reports.service";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("fleet-statistics")
  @ApiOperation({ summary: "Get fleet statistics" })
  @ApiResponse({
    status: 200,
    description: "Fleet statistics retrieved successfully",
  })
  getFleetStatistics() {
    return this.reportsService.getFleetStatistics();
  }

  @Get("trips")
  @ApiOperation({ summary: "Get trip reports" })
  @ApiResponse({
    status: 200,
    description: "Trip reports retrieved successfully",
  })
  getTripReports() {
    return this.reportsService.getTripReports();
  }

  // @Get('driver-performance')
  // @ApiOperation({ summary: 'Get driver performance reports' })
  // @ApiResponse({ status: 200, description: 'Driver performance reports retrieved successfully' })
  // getDriverPerformance() {
  //   return this.reportsService.getDriverPerformance();
  // }

  @Get("truck-utilization")
  @ApiOperation({ summary: "Get truck utilization reports" })
  @ApiResponse({
    status: 200,
    description: "Truck utilization reports retrieved successfully",
  })
  getTruckUtilization() {
    return this.reportsService.getTruckUtilization();
  }

  @Get("monthly/:year")
  @ApiOperation({ summary: "Get monthly reports for a specific year" })
  @ApiResponse({
    status: 200,
    description: "Monthly reports retrieved successfully",
  })
  getMonthlyReports(@Param("year") year: string) {
    return this.reportsService.getMonthlyReports(+year);
  }

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard metrics" })
  @ApiResponse({
    status: 200,
    description: "Dashboard metrics retrieved successfully",
  })
  getDashboardMetrics() {
    return this.reportsService.getDashboardMetrics();
  }

  @Get("fleet-statistics/:startDate/:endDate")
  @ApiOperation({ summary: "Get fleet statistics for date range" })
  @ApiResponse({
    status: 200,
    description: "Fleet statistics retrieved successfully",
  })
  getFleetStatisticsDateRange(
    @Param("startDate") startDate: string,
    @Param("endDate") endDate: string
  ) {
    return this.reportsService.getFleetStatistics(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get("trips/:startDate/:endDate")
  @ApiOperation({ summary: "Get trip reports for date range" })
  @ApiResponse({
    status: 200,
    description: "Trip reports retrieved successfully",
  })
  getTripReportsDateRange(
    @Param("startDate") startDate: string,
    @Param("endDate") endDate: string
  ) {
    return this.reportsService.getTripReports(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get("driver-performance/:startDate/:endDate")
  @ApiOperation({ summary: "Get driver performance for date range" })
  @ApiResponse({
    status: 200,
    description: "Driver performance retrieved successfully",
  })
  getDriverPerformanceDateRange(
    @Param("startDate") startDate: string,
    @Param("endDate") endDate: string
  ) {
    return this.reportsService.getDriverPerformance(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get("truck-utilization/:startDate/:endDate")
  @ApiOperation({ summary: "Get truck utilization for date range" })
  @ApiResponse({
    status: 200,
    description: "Truck utilization retrieved successfully",
  })
  getTruckUtilizationDateRange(
    @Param("startDate") startDate: string,
    @Param("endDate") endDate: string
  ) {
    return this.reportsService.getTruckUtilization(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get("financial-summary")
  @ApiOperation({ summary: "Get financial summary report" })
  @ApiResponse({
    status: 200,
    description: "Financial summary retrieved successfully",
  })
  getFinancialSummary() {
    return this.reportsService.getFinancialSummary();
  }

  @Get("operational-efficiency")
  @ApiOperation({ summary: "Get operational efficiency metrics" })
  @ApiResponse({
    status: 200,
    description: "Operational efficiency metrics retrieved successfully",
  })
  getOperationalEfficiency() {
    return this.reportsService.getOperationalEfficiency();
  }

  @Get("maintenance-schedule")
  @ApiOperation({ summary: "Get maintenance schedule and costs" })
  @ApiResponse({
    status: 200,
    description: "Maintenance schedule retrieved successfully",
  })
  getMaintenanceSchedule() {
    return this.reportsService.getMaintenanceSchedule();
  }

  // @Get("driver-rankings")
  // @ApiOperation({ summary: "Get driver performance rankings" })
  // @ApiResponse({
  //   status: 200,
  //   description: "Driver rankings retrieved successfully",
  // })
  // getDriverRankings() {
  //   return this.reportsService.getDriverRankings();
  // }

  // @Get("route-optimization")
  // @ApiOperation({ summary: "Get route optimization insights" })
  // @ApiResponse({
  //   status: 200,
  //   description: "Route optimization insights retrieved successfully",
  // })
  // getRouteOptimization() {
  //   return this.reportsService.getRouteOptimization();
  // }

  @Get("fuel-consumption")
  @ApiOperation({ summary: "Get fuel consumption analysis" })
  @ApiResponse({
    status: 200,
    description: "Fuel consumption analysis retrieved successfully",
  })
  getFuelConsumption() {
    return this.reportsService.getFuelConsumption();
  }
}
