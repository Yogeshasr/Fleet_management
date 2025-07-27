
# Fleet Management API

A comprehensive backend API for truck fleet management system built with NestJS, TypeScript, and SQLite.

## Features

- **Authentication & Authorization**: JWT-based authentication system
- **Truck Management**: Complete CRUD operations for fleet vehicles
- **Driver Management**: Driver profiles with license tracking and statistics
- **Client Management**: Customer relationship management
- **Trip Management**: Trip planning, tracking, and completion workflows
- **Reports & Analytics**: Comprehensive reporting system with performance metrics
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: SQLite with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:5000`

### API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:5000/api/docs`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Health Check
- `GET /api` - Basic health check
- `GET /api/health` - Detailed health information

### Trucks
- `POST /api/trucks` - Create truck
- `GET /api/trucks` - Get all trucks
- `GET /api/trucks/available` - Get available trucks
- `GET /api/trucks/:id` - Get truck by ID
- `PATCH /api/trucks/:id` - Update truck
- `DELETE /api/trucks/:id` - Delete truck

### Drivers
- `POST /api/drivers` - Create driver
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/available` - Get available drivers
- `GET /api/drivers/search/:searchTerm` - Search drivers
- `GET /api/drivers/statistics/overview` - Get driver statistics
- `GET /api/drivers/:id` - Get driver by ID
- `PATCH /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Clients
- `POST /api/clients` - Create client
- `GET /api/clients` - Get all clients
- `GET /api/clients/search/:searchTerm` - Search clients
- `GET /api/clients/statistics/overview` - Get client statistics
- `GET /api/clients/:id` - Get client by ID
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Trips
- `POST /api/trips` - Create trip
- `GET /api/trips` - Get all trips
- `GET /api/trips/statistics/overview` - Get trip statistics
- `GET /api/trips/active/list` - Get active trips
- `GET /api/trips/driver/:driverId` - Get trips by driver
- `GET /api/trips/truck/:truckId` - Get trips by truck
- `GET /api/trips/:id` - Get trip by ID
- `PATCH /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/start` - Start trip
- `POST /api/trips/:id/complete` - Complete trip

### Reports
- `GET /api/reports/fleet-statistics` - Fleet statistics
- `GET /api/reports/trips` - Trip reports
- `GET /api/reports/driver-performance` - Driver performance
- `GET /api/reports/truck-utilization` - Truck utilization
- `GET /api/reports/monthly/:year` - Monthly reports
- `GET /api/reports/dashboard` - Dashboard metrics

### Users
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Database

The application uses PostgreSQL with TypeORM for database operations. The database connection is configured via the `DATABASE_URL` environment variable.

## Environment Variables

Environment variables (set via Replit Secrets):

```env
NODE_ENV=development
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://username:password@host:port/database
PORT=5000
```

## Production Deployment

For production deployment on Replit:

1. The application is configured to run on port 5000
2. Build command: `npm run build`
3. Start command: `npm run start:prod`
4. The API will be accessible at your Replit deployment URL

## License

This project is licensed under the MIT License.
