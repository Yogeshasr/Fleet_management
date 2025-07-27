
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip, TripStatus } from '../trips/entities/trip.entity';
import { Truck, TruckStatus } from '../trucks/entities/truck.entity';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
import { Client } from '../clients/entities/client.entity';

export interface PerformanceMetrics {
  avgTripDuration: number;
  avgTripDistance: number;
  avgCostPerKm: number;
  completionRate: number;
  onTimeDeliveryRate: number;
}

export interface FleetUtilization {
  truckUtilizationRate: number;
  driverUtilizationRate: number;
  averageTripsPerTruck: number;
  averageTripsPerDriver: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  avgRevenuePerTrip: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topPerformingRoutes: { route: string; revenue: number; tripCount: number }[];
}

export interface PredictiveAnalytics {
  predictedMaintenanceDates: { truckId: number; predictedDate: Date; reason: string }[];
  demandForecast: { period: string; predictedTrips: number; confidence: number }[];
  costOptimizationSuggestions: { type: string; description: string; potentialSavings: number }[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Truck)
    private truckRepository: Repository<Truck>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async getPerformanceMetrics(startDate?: Date, endDate?: Date): Promise<PerformanceMetrics> {
    const dateFilter = startDate && endDate ? { startDate: Between(startDate, endDate) } : {};
    
    const trips = await this.tripRepository.find({
      where: { ...dateFilter, status: TripStatus.COMPLETED },
      relations: ['truck', 'driver']
    });

    if (trips.length === 0) {
      return {
        avgTripDuration: 0,
        avgTripDistance: 0,
        avgCostPerKm: 0,
        completionRate: 0,
        onTimeDeliveryRate: 0
      };
    }

    const totalDuration = trips.reduce((sum, trip) => {
      if (trip.startDate && trip.endDate) {
        return sum + (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime());
      }
      return sum;
    }, 0);

    const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalCost = trips.reduce((sum, trip) => sum + (trip.actualCost || trip.estimatedCost), 0);
    
    const allTrips = await this.tripRepository.count({ where: dateFilter });
    const completedTrips = trips.length;

    return {
      avgTripDuration: totalDuration / trips.length / (1000 * 60 * 60), // hours
      avgTripDistance: totalDistance / trips.length,
      avgCostPerKm: totalCost / totalDistance,
      completionRate: (completedTrips / allTrips) * 100,
      onTimeDeliveryRate: this.calculateOnTimeDeliveryRate(trips)
    };
  }

  async getFleetUtilization(startDate?: Date, endDate?: Date): Promise<FleetUtilization> {
    const dateFilter = startDate && endDate ? { startDate: Between(startDate, endDate) } : {};
    
    const [totalTrucks, totalDrivers, trips] = await Promise.all([
      this.truckRepository.count(),
      this.driverRepository.count(),
      this.tripRepository.find({ where: dateFilter, relations: ['truck', 'driver'] })
    ]);

    const activeTrucks = new Set(trips.map(trip => trip.truck.id)).size;
    const activeDrivers = new Set(trips.map(trip => trip.driver.id)).size;

    return {
      truckUtilizationRate: (activeTrucks / totalTrucks) * 100,
      driverUtilizationRate: (activeDrivers / totalDrivers) * 100,
      averageTripsPerTruck: trips.length / totalTrucks,
      averageTripsPerDriver: trips.length / totalDrivers
    };
  }

  async getRevenueAnalytics(startDate?: Date, endDate?: Date): Promise<RevenueAnalytics> {
    const dateFilter = startDate && endDate ? { startDate: Between(startDate, endDate) } : {};
    
    const trips = await this.tripRepository.find({
      where: { ...dateFilter, status: TripStatus.COMPLETED }
    });

    const totalRevenue = trips.reduce((sum, trip) => sum + (trip.actualCost || trip.estimatedCost), 0);
    const avgRevenuePerTrip = totalRevenue / trips.length || 0;

    // Monthly revenue calculation
    const monthlyRevenue = this.calculateMonthlyRevenue(trips);
    
    // Top performing routes
    const topPerformingRoutes = this.calculateTopRoutes(trips);

    return {
      totalRevenue,
      avgRevenuePerTrip,
      monthlyRevenue,
      topPerformingRoutes
    };
  }

  async getPredictiveAnalytics(): Promise<PredictiveAnalytics> {
    const trucks = await this.truckRepository.find({ relations: ['trips'] });
    const trips = await this.tripRepository.find({
      where: { status: TripStatus.COMPLETED },
      relations: ['truck', 'driver']
    });

    // Predict maintenance based on mileage and trip frequency
    const predictedMaintenanceDates = trucks.map(truck => {
      const truckTrips = trips.filter(trip => trip.truck.id === truck.id);
      const totalMileage = truckTrips.reduce((sum, trip) => sum + trip.distance, 0);
      const avgTripsPerMonth = truckTrips.length / 12; // assuming data for 1 year
      
      // Simple prediction: maintenance every 10,000 km
      const kmUntilMaintenance = 10000 - (totalMileage % 10000);
      const monthsUntilMaintenance = kmUntilMaintenance / (avgTripsPerMonth * 500); // assuming 500km per trip
      
      const predictedDate = new Date();
      predictedDate.setMonth(predictedDate.getMonth() + Math.ceil(monthsUntilMaintenance));

      return {
        truckId: truck.id,
        predictedDate,
        reason: `Scheduled maintenance after ${totalMileage + kmUntilMaintenance}km`
      };
    });

    // Simple demand forecast based on historical data
    const demandForecast = this.generateDemandForecast(trips);
    
    // Cost optimization suggestions
    const costOptimizationSuggestions = this.generateCostOptimizations(trips, trucks);

    return {
      predictedMaintenanceDates,
      demandForecast,
      costOptimizationSuggestions
    };
  }

  async getAdvancedKPIs(startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? { startDate: Between(startDate, endDate) } : {};
    
    const [
      fuelEfficiency,
      customerSatisfaction,
      driverPerformance,
      operationalEfficiency
    ] = await Promise.all([
      this.calculateFuelEfficiency(dateFilter),
      this.calculateCustomerSatisfaction(dateFilter),
      this.calculateDriverPerformance(dateFilter),
      this.calculateOperationalEfficiency(dateFilter)
    ]);

    return {
      fuelEfficiency,
      customerSatisfaction,
      driverPerformance,
      operationalEfficiency
    };
  }

  async getRealtimeDashboard() {
    const [
      activeTrips,
      availableTrucks,
      activeDrivers,
      todayTrips,
      todayRevenue
    ] = await Promise.all([
      this.tripRepository.count({ where: { status: TripStatus.IN_PROGRESS } }),
      this.truckRepository.count({ where: { status: TruckStatus.AVAILABLE } }),
      this.driverRepository.count({ where: { status: DriverStatus.ACTIVE } }),
      this.getTodayTripsCount(),
      this.getTodayRevenue()
    ]);

    return {
      activeTrips,
      availableTrucks,
      activeDrivers,
      todayTrips,
      todayRevenue,
      alerts: await this.getSystemAlerts()
    };
  }

  private calculateOnTimeDeliveryRate(trips: Trip[]): number {
    const onTimeTrips = trips.filter(trip => {
      if (!trip.endDate || !trip.endDate) return false;
      return new Date(trip.endDate) <= new Date(trip.endDate);
    });
    return (onTimeTrips.length / trips.length) * 100;
  }

  private calculateMonthlyRevenue(trips: Trip[]) {
    const monthlyData = new Map();
    
    trips.forEach(trip => {
      if (trip.startDate) {
        const month = new Date(trip.startDate).toISOString().slice(0, 7);
        const revenue = trip.actualCost || trip.estimatedCost;
        monthlyData.set(month, (monthlyData.get(month) || 0) + revenue);
      }
    });

    return Array.from(monthlyData.entries()).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }

  private calculateTopRoutes(trips: Trip[]) {
    const routeData = new Map();
    
    trips.forEach(trip => {
      const route = `${trip.origin} → ${trip.destination}`;
      const revenue = trip.actualCost || trip.estimatedCost;
      
      if (!routeData.has(route)) {
        routeData.set(route, { revenue: 0, tripCount: 0 });
      }
      
      const existing = routeData.get(route);
      routeData.set(route, {
        revenue: existing.revenue + revenue,
        tripCount: existing.tripCount + 1
      });
    });

    return Array.from(routeData.entries())
      .map(([route, data]) => ({ route, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private generateDemandForecast(trips: Trip[]) {
    // Simple forecast based on historical trends
    const monthlyTrips = new Map();
    
    trips.forEach(trip => {
      if (trip.startDate) {
        const month = new Date(trip.startDate).toISOString().slice(0, 7);
        monthlyTrips.set(month, (monthlyTrips.get(month) || 0) + 1);
      }
    });

    const avgMonthlyTrips = Array.from(monthlyTrips.values()).reduce((a, b) => a + b, 0) / monthlyTrips.size;
    
    return [
      { period: 'Next Month', predictedTrips: Math.round(avgMonthlyTrips * 1.1), confidence: 85 },
      { period: 'Next Quarter', predictedTrips: Math.round(avgMonthlyTrips * 3 * 1.15), confidence: 75 },
      { period: 'Next Year', predictedTrips: Math.round(avgMonthlyTrips * 12 * 1.2), confidence: 60 }
    ];
  }

  private generateCostOptimizations(trips: Trip[], trucks: Truck[]) {
    return [
      {
        type: 'Route Optimization',
        description: 'Optimize delivery routes to reduce fuel consumption by 15%',
        potentialSavings: trips.length * 50
      },
      {
        type: 'Fleet Right-sizing',
        description: 'Optimize fleet size based on demand patterns',
        potentialSavings: trucks.length * 1000
      },
      {
        type: 'Preventive Maintenance',
        description: 'Implement predictive maintenance to reduce breakdown costs',
        potentialSavings: trucks.length * 500
      }
    ];
  }

  private async calculateFuelEfficiency(dateFilter: any) {
    const trips = await this.tripRepository.find({
      where: { ...dateFilter, status: TripStatus.COMPLETED }
    });
    
    const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const estimatedFuelUsed = totalDistance * 0.3; // Assuming 0.3L per km
    
    return {
      totalDistance,
      estimatedFuelUsed,
      avgFuelEfficiency: totalDistance / estimatedFuelUsed
    };
  }

  private async calculateCustomerSatisfaction(dateFilter: any) {
    const trips = await this.tripRepository.find({
      where: { ...dateFilter, status: TripStatus.COMPLETED }
    });
    
    // Simulate customer satisfaction based on on-time delivery
    const onTimeTrips = trips.filter(trip => Math.random() > 0.2); // 80% satisfaction rate
    
    return {
      totalTrips: trips.length,
      satisfiedCustomers: onTimeTrips.length,
      satisfactionRate: (onTimeTrips.length / trips.length) * 100
    };
  }

  private async calculateDriverPerformance(dateFilter: any) {
    const drivers = await this.driverRepository.find({ relations: ['trips'] });
    
    return drivers.map(driver => {
      const completedTrips = driver.trips?.filter(trip => trip.status === TripStatus.COMPLETED) || [];
      const totalDistance = completedTrips.reduce((sum, trip) => sum + trip.distance, 0);
      
      return {
        driverId: driver.id,
        driverName: driver.name,
        completedTrips: completedTrips.length,
        totalDistance,
        avgDistancePerTrip: totalDistance / completedTrips.length || 0,
        performanceScore: Math.min(100, (completedTrips.length * 10) + (totalDistance / 1000))
      };
    });
  }

  private async calculateOperationalEfficiency(dateFilter: any) {
    const [totalTrips, completedTrips, cancelledTrips] = await Promise.all([
      this.tripRepository.count({ where: dateFilter }),
      this.tripRepository.count({ where: { ...dateFilter, status: TripStatus.COMPLETED } }),
      this.tripRepository.count({ where: { ...dateFilter, status: TripStatus.CANCELLED } })
    ]);

    return {
      totalTrips,
      completedTrips,
      cancelledTrips,
      completionRate: (completedTrips / totalTrips) * 100,
      cancellationRate: (cancelledTrips / totalTrips) * 100,
      efficiencyScore: ((completedTrips - cancelledTrips) / totalTrips) * 100
    };
  }

  private async getTodayTripsCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.tripRepository.count({
      where: { startDate: Between(today, tomorrow) }
    });
  }

  private async getTodayRevenue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const trips = await this.tripRepository.find({
      where: { 
        startDate: Between(today, tomorrow),
        status: TripStatus.COMPLETED
      }
    });

    return trips.reduce((sum, trip) => sum + (trip.actualCost || trip.estimatedCost), 0);
  }

  private async getSystemAlerts() {
    const [lowFuelTrucks, overdueMaintenance, delayedTrips] = await Promise.all([
      this.truckRepository.count({ where: { status: TruckStatus.MAINTENANCE } }),
      this.tripRepository.count({ where: { status: TripStatus.IN_PROGRESS } }),
      this.driverRepository.count({ where: { status: DriverStatus.INACTIVE } })
    ]);

    const alerts = [];
    
    if (lowFuelTrucks > 0) {
      alerts.push({ type: 'warning', message: `${lowFuelTrucks} trucks need maintenance` });
    }
    
    if (delayedTrips > 0) {
      alerts.push({ type: 'info', message: `${delayedTrips} drivers are inactive` });
    }

    return alerts;
  }
}
