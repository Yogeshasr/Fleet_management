
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from '../trips/entities/trip.entity';
import { Truck, TruckStatus } from '../trucks/entities/truck.entity';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
import { Between } from 'typeorm';

export interface FleetStatistics {
  totalTrucks: number;
  activeTrucks: number;
  totalDrivers: number;
  activeDrivers: number;
  totalTrips: number;
  completedTrips: number;
  ongoingTrips: number;
  totalRevenue: number;
  totalDistance: number;
  totalExpenses: number;
  profitMargin: number;
}

export interface TripReport {
  tripId: number;
  truckLicensePlate: string;
  driverName: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  distance: number;
  revenue: number;
  totalExpenses: number;
  profit: number;
  status: TripStatus;
}

export interface DriverPerformance {
  driverId: number;
  driverName: string;
  totalTrips: number;
  completedTrips: number;
  totalDistance: number;
  totalRevenue: number;
  averageRating: number;
  efficiency: number;
}

export interface TruckUtilization {
  truckId: number;
  licensePlate: string;
  model: string;
  totalTrips: number;
  totalDistance: number;
  totalRevenue: number;
  maintenanceCost: number;
  utilizationRate: number;
  profitability: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Truck)
    private truckRepository: Repository<Truck>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async getFleetStatistics(startDate?: Date, endDate?: Date): Promise<FleetStatistics> {
    const dateFilter = startDate && endDate ? Between(startDate, endDate) : undefined;
    
    const [totalTrucks, activeTrucks] = await Promise.all([
      this.truckRepository.count(),
      this.truckRepository.count({ where: { status: TruckStatus.AVAILABLE } }),
    ]);

    const [totalDrivers, activeDrivers] = await Promise.all([
      this.driverRepository.count(),
      this.driverRepository.count({ where: { status: DriverStatus.ACTIVE } }),
    ]);

    const tripsQuery = this.tripRepository.createQueryBuilder('trip');
    if (dateFilter) {
      tripsQuery.where('trip.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const [totalTrips, completedTrips, ongoingTrips] = await Promise.all([
      tripsQuery.getCount(),
      tripsQuery.clone().andWhere('trip.status = :status', { status: TripStatus.COMPLETED }).getCount(),
      tripsQuery.clone().andWhere('trip.status = :status', { status: TripStatus.IN_PROGRESS }).getCount(),
    ]);

    const revenueQuery = this.tripRepository.createQueryBuilder('trip')
      .select('SUM(trip.revenue)', 'totalRevenue')
      .addSelect('SUM(trip.distance)', 'totalDistance')
      .addSelect('SUM(trip.fuelCost + trip.maintenanceCost + trip.otherExpenses)', 'totalExpenses');
    
    if (dateFilter) {
      revenueQuery.where('trip.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const result = await revenueQuery.getRawOne();
    
    const totalRevenue = parseFloat(result.totalRevenue) || 0;
    const totalDistance = parseFloat(result.totalDistance) || 0;
    const totalExpenses = parseFloat(result.totalExpenses) || 0;
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

    return {
      totalTrucks,
      activeTrucks,
      totalDrivers,
      activeDrivers,
      totalTrips,
      completedTrips,
      ongoingTrips,
      totalRevenue,
      totalDistance,
      totalExpenses,
      profitMargin: Math.round(profitMargin * 100) / 100,
    };
  }

  async getTripReports(startDate?: Date, endDate?: Date): Promise<TripReport[]> {
    const query = this.tripRepository.createQueryBuilder('trip')
      .leftJoinAndSelect('trip.truck', 'truck')
      .leftJoinAndSelect('trip.driver', 'driver')
      .leftJoinAndSelect('trip.client', 'client');

    if (startDate && endDate) {
      query.where('trip.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    query.orderBy('trip.startDate', 'DESC');

    const trips = await query.getMany();

    return trips.map(trip => ({
      tripId: trip.id,
      truckLicensePlate: trip.truck.licensePlate,
      driverName: trip.driver.name,
      origin: trip.origin,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      distance: trip.distance,
      revenue: trip.revenue,
      totalExpenses: trip.fuelCost + trip.maintenanceCost + trip.otherExpenses,
      profit: trip.revenue - (trip.fuelCost + trip.maintenanceCost + trip.otherExpenses),
      status: trip.status,
    }));
  }

  async getDriverPerformance(startDate?: Date, endDate?: Date): Promise<DriverPerformance[]> {
    const query = this.driverRepository.createQueryBuilder('driver')
      .leftJoin('driver.trips', 'trip')
      .select([
        'driver.id as driverId',
        'driver.name as driverName',
        'COUNT(trip.id) as totalTrips',
        'COUNT(CASE WHEN trip.status = :completedStatus THEN 1 END) as completedTrips',
        'COALESCE(SUM(trip.distance), 0) as totalDistance',
        'COALESCE(SUM(trip.revenue), 0) as totalRevenue',
      ])
      .setParameter('completedStatus', TripStatus.COMPLETED)
      .groupBy('driver.id, driver.name');

    if (startDate && endDate) {
      query.andWhere('trip.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const results = await query.getRawMany();

    return results.map(result => ({
      driverId: result.driverId,
      driverName: result.driverName,
      totalTrips: parseInt(result.totalTrips) || 0,
      completedTrips: parseInt(result.completedTrips) || 0,
      totalDistance: parseFloat(result.totalDistance) || 0,
      totalRevenue: parseFloat(result.totalRevenue) || 0,
      averageRating: 4.5, // Placeholder - would need rating system
      efficiency: parseInt(result.completedTrips) > 0 ? 
        (parseInt(result.completedTrips) / parseInt(result.totalTrips)) * 100 : 0,
    }));
  }

  async getTruckUtilization(startDate?: Date, endDate?: Date): Promise<TruckUtilization[]> {
    const query = this.truckRepository.createQueryBuilder('truck')
      .leftJoin('truck.trips', 'trip')
      .select([
        'truck.id as truckId',
        'truck.licensePlate as licensePlate',
        'truck.model as model',
        'COUNT(trip.id) as totalTrips',
        'COALESCE(SUM(trip.distance), 0) as totalDistance',
        'COALESCE(SUM(trip.revenue), 0) as totalRevenue',
        'COALESCE(SUM(trip.maintenanceCost), 0) as maintenanceCost',
      ])
      .groupBy('truck.id, truck.licensePlate, truck.model');

    if (startDate && endDate) {
      query.andWhere('trip.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const results = await query.getRawMany();

    return results.map(result => {
      const totalRevenue = parseFloat(result.totalRevenue) || 0;
      const maintenanceCost = parseFloat(result.maintenanceCost) || 0;
      const totalTrips = parseInt(result.totalTrips) || 0;
      
      return {
        truckId: result.truckId,
        licensePlate: result.licensePlate,
        model: result.model,
        totalTrips,
        totalDistance: parseFloat(result.totalDistance) || 0,
        totalRevenue,
        maintenanceCost,
        utilizationRate: totalTrips > 0 ? Math.min((totalTrips / 30) * 100, 100) : 0, // Assuming 30 trips per month is 100% utilization
        profitability: totalRevenue > 0 ? ((totalRevenue - maintenanceCost) / totalRevenue) * 100 : 0,
      };
    });
  }

  async getMonthlyReports(year: number): Promise<any[]> {
    const monthlyData = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const stats = await this.getFleetStatistics(startDate, endDate);
      
      monthlyData.push({
        month: month,
        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        year,
        ...stats,
      });
    }
    
    return monthlyData;
  }

  async getDashboardMetrics(): Promise<any> {
    const [fleetStats, tripReports, driverPerformance, truckUtilization] = await Promise.all([
      this.getFleetStatistics(),
      this.getTripReports(),
      this.getDriverPerformance(),
      this.getTruckUtilization(),
    ]);

    // Get recent trips (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentTrips = await this.getTripReports(lastWeek, new Date());

    // Calculate key metrics
    const totalActiveVehicles = fleetStats.activeTrucks;
    const totalActiveDrivers = fleetStats.activeDrivers;
    const weeklyRevenue = recentTrips.reduce((sum, trip) => sum + trip.revenue, 0);
    const weeklyTrips = recentTrips.length;
    const averageTripValue = weeklyTrips > 0 ? weeklyRevenue / weeklyTrips : 0;

    // Top performing drivers (by revenue)
    const topDrivers = driverPerformance
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Most utilized trucks
    const topTrucks = truckUtilization
      .sort((a, b) => b.utilizationRate - a.utilizationRate)
      .slice(0, 5);

    return {
      summary: {
        totalActiveVehicles,
        totalActiveDrivers,
        weeklyRevenue,
        weeklyTrips,
        averageTripValue,
        profitMargin: fleetStats.profitMargin,
      },
      recentActivity: {
        recentTrips: recentTrips.slice(0, 10), // Last 10 trips
        topDrivers,
        topTrucks,
      },
      kpis: {
        fleetUtilization: totalActiveVehicles > 0 ? (fleetStats.activeTrucks / fleetStats.totalTrucks) * 100 : 0,
        driverUtilization: totalActiveDrivers > 0 ? (fleetStats.activeDrivers / fleetStats.totalDrivers) * 100 : 0,
        completionRate: fleetStats.totalTrips > 0 ? (fleetStats.completedTrips / fleetStats.totalTrips) * 100 : 0,
        averageDistance: fleetStats.totalTrips > 0 ? fleetStats.totalDistance / fleetStats.totalTrips : 0,
      },
    };
  }

  async getFinancialSummary(): Promise<any> {
    const fleetStats = await this.getFleetStatistics();
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    
    const lastMonthStats = await this.getFleetStatistics(lastMonth, lastMonthEnd);
    
    const revenueGrowth = lastMonthStats.totalRevenue > 0 
      ? ((fleetStats.totalRevenue - lastMonthStats.totalRevenue) / lastMonthStats.totalRevenue) * 100 
      : 0;

    return {
      currentPeriod: {
        totalRevenue: fleetStats.totalRevenue,
        totalExpenses: fleetStats.totalExpenses,
        netProfit: fleetStats.totalRevenue - fleetStats.totalExpenses,
        profitMargin: fleetStats.profitMargin,
      },
      previousPeriod: {
        totalRevenue: lastMonthStats.totalRevenue,
        totalExpenses: lastMonthStats.totalExpenses,
        netProfit: lastMonthStats.totalRevenue - lastMonthStats.totalExpenses,
        profitMargin: lastMonthStats.profitMargin,
      },
      growth: {
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        expenseGrowth: lastMonthStats.totalExpenses > 0 
          ? ((fleetStats.totalExpenses - lastMonthStats.totalExpenses) / lastMonthStats.totalExpenses) * 100 
          : 0,
      },
    };
  }

  async getOperationalEfficiency(): Promise<any> {
    const [trips, trucks, drivers] = await Promise.all([
      this.tripRepository.find({ relations: ['truck', 'driver'] }),
      this.truckRepository.find(),
      this.driverRepository.find(),
    ]);

    const completedTrips = trips.filter(trip => trip.status === TripStatus.COMPLETED);
    const avgTripDuration = completedTrips.length > 0 
      ? completedTrips.reduce((sum, trip) => {
          const duration = trip.endDate ? 
            (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60) : 0;
          return sum + duration;
        }, 0) / completedTrips.length
      : 0;

    const fuelEfficiency = completedTrips.length > 0
      ? completedTrips.reduce((sum, trip) => sum + (trip.distance / (trip.fuelCost / 1.5)), 0) / completedTrips.length // Assuming $1.5 per liter
      : 0;

    return {
      efficiency: {
        avgTripDuration: Math.round(avgTripDuration * 100) / 100,
        avgFuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
        onTimeDeliveryRate: 95, // Placeholder
        vehicleDowntime: 5, // Placeholder percentage
      },
      utilization: {
        fleetUtilization: trucks.length > 0 ? (trucks.filter(t => t.status === TruckStatus.AVAILABLE).length / trucks.length) * 100 : 0,
        driverUtilization: drivers.length > 0 ? (drivers.filter(d => d.status === DriverStatus.ACTIVE).length / drivers.length) * 100 : 0,
      },
    };
  }

  async getMaintenanceSchedule(): Promise<any> {
    const trucks = await this.truckRepository.find({ relations: ['trips'] });
    
    const maintenanceData = trucks.map(truck => {
      const totalMaintenanceCost = truck.trips.reduce((sum, trip) => sum + trip.maintenanceCost, 0);
      const totalDistance = truck.trips.reduce((sum, trip) => sum + trip.distance, 0);
      const avgMaintenancePerKm = totalDistance > 0 ? totalMaintenanceCost / totalDistance : 0;
      
      return {
        truckId: truck.id,
        licensePlate: truck.licensePlate,
        model: truck.model,
        totalMaintenanceCost,
        avgMaintenancePerKm: Math.round(avgMaintenancePerKm * 100) / 100,
        lastMaintenance: '2024-01-15', // Placeholder
        nextMaintenance: '2024-02-15', // Placeholder
        maintenanceStatus: totalMaintenanceCost > 5000 ? 'High Cost' : 'Normal',
      };
    });

    return {
      schedule: maintenanceData,
      summary: {
        totalMaintenanceCost: maintenanceData.reduce((sum, truck) => sum + truck.totalMaintenanceCost, 0),
        avgCostPerVehicle: maintenanceData.length > 0 
          ? maintenanceData.reduce((sum, truck) => sum + truck.totalMaintenanceCost, 0) / maintenanceData.length 
          : 0,
        upcomingMaintenance: maintenanceData.filter(truck => truck.maintenanceStatus === 'High Cost').length,
      },
    };
  }

  async getDriverRankings(): Promise<any> {
    const driverPerformance = await this.getDriverPerformance();
    
    const rankings = driverPerformance
      .map(driver => ({
        ...driver,
        score: (driver.efficiency * 0.4) + (driver.totalRevenue / 1000 * 0.3) + (driver.averageRating * 20 * 0.3),
      }))
      .sort((a, b) => b.score - a.score)
      .map((driver, index) => ({ ...driver, rank: index + 1 }));

    return {
      rankings,
      topPerformer: rankings[0] || null,
      categories: {
        byRevenue: rankings.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5),
        byEfficiency: rankings.sort((a, b) => b.efficiency - a.efficiency).slice(0, 5),
        byTripsCompleted: rankings.sort((a, b) => b.completedTrips - a.completedTrips).slice(0, 5),
      },
    };
  }

  async getRouteOptimization(): Promise<any> {
    const trips = await this.tripRepository.find({ 
      where: { status: TripStatus.COMPLETED },
      relations: ['truck', 'driver'] 
    });

    const routeAnalysis = trips.reduce((acc, trip) => {
      const route = `${trip.origin}-${trip.destination}`;
      if (!acc[route]) {
        acc[route] = {
          route,
          totalTrips: 0,
          totalDistance: 0,
          totalRevenue: 0,
          avgDuration: 0,
          efficiency: 0,
        };
      }
      
      acc[route].totalTrips++;
      acc[route].totalDistance += trip.distance;
      acc[route].totalRevenue += trip.revenue;
      
      return acc;
    }, {});

    const routes = Object.values(routeAnalysis).map((route: any) => ({
      ...route,
      avgDistance: route.totalDistance / route.totalTrips,
      avgRevenue: route.totalRevenue / route.totalTrips,
      revenuePerKm: route.totalDistance > 0 ? route.totalRevenue / route.totalDistance : 0,
    }));

    return {
      routes: routes.sort((a, b) => b.revenuePerKm - a.revenuePerKm),
      insights: {
        mostProfitableRoute: routes.reduce((max, route) => route.revenuePerKm > max.revenuePerKm ? route : max, routes[0]),
        mostFrequentRoute: routes.reduce((max, route) => route.totalTrips > max.totalTrips ? route : max, routes[0]),
        longestRoute: routes.reduce((max, route) => route.avgDistance > max.avgDistance ? route : max, routes[0]),
      },
    };
  }

  async getFuelConsumption(): Promise<any> {
    const trips = await this.tripRepository.find({ 
      where: { status: TripStatus.COMPLETED },
      relations: ['truck', 'driver'] 
    });

    const fuelAnalysis = trips.reduce((acc, trip) => {
      const estimatedFuelConsumption = trip.fuelCost / 1.5; // Assuming $1.5 per liter
      const fuelEfficiency = trip.distance > 0 ? trip.distance / estimatedFuelConsumption : 0;
      
      return {
        totalFuelCost: acc.totalFuelCost + trip.fuelCost,
        totalDistance: acc.totalDistance + trip.distance,
        totalFuelConsumed: acc.totalFuelConsumed + estimatedFuelConsumption,
        trips: [...acc.trips, {
          tripId: trip.id,
          distance: trip.distance,
          fuelCost: trip.fuelCost,
          estimatedFuelConsumed: estimatedFuelConsumption,
          efficiency: fuelEfficiency,
          truck: trip.truck.licensePlate,
        }],
      };
    }, { totalFuelCost: 0, totalDistance: 0, totalFuelConsumed: 0, trips: [] });

    const avgFuelEfficiency = fuelAnalysis.totalDistance > 0 
      ? fuelAnalysis.totalDistance / fuelAnalysis.totalFuelConsumed 
      : 0;

    return {
      summary: {
        totalFuelCost: Math.round(fuelAnalysis.totalFuelCost * 100) / 100,
        totalFuelConsumed: Math.round(fuelAnalysis.totalFuelConsumed * 100) / 100,
        avgFuelEfficiency: Math.round(avgFuelEfficiency * 100) / 100,
        costPerKm: fuelAnalysis.totalDistance > 0 ? fuelAnalysis.totalFuelCost / fuelAnalysis.totalDistance : 0,
      },
      trends: {
        dailyConsumption: [], // Placeholder for daily fuel consumption data
        monthlyConsumption: [], // Placeholder for monthly fuel consumption data
      },
      vehicles: fuelAnalysis.trips
        .reduce((acc, trip) => {
          if (!acc[trip.truck]) {
            acc[trip.truck] = {
              truck: trip.truck,
              totalFuelCost: 0,
              totalDistance: 0,
              avgEfficiency: 0,
            };
          }
          acc[trip.truck].totalFuelCost += trip.fuelCost;
          acc[trip.truck].totalDistance += trip.distance;
          return acc;
        }, {})
    };
  }
}
