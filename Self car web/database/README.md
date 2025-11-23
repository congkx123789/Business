# Database Setup Guide

## Overview

This directory contains the database schema and seed data for the SelfCar application.

## Database Structure

### Tables

1. **users** - Stores user information (customers and admins)
2. **cars** - Stores car inventory details
3. **bookings** - Stores rental booking information

### Entity Relationships

- A User can have many Bookings (One-to-Many)
- A Car can have many Bookings (One-to-Many)
- A Booking belongs to one User and one Car (Many-to-One)

## Setup Instructions

### 1. Create Database

```bash
mysql -u root -p < schema.sql
```

### 2. Load Sample Data (Optional)

```bash
mysql -u root -p < seed_data.sql
```

## Database Configuration

Update the `application.properties` file in the backend with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/selfcar_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Default Credentials

### Admin User
- Email: admin@selfcar.com
- Password: admin123

### Sample Customer
- Email: john.doe@example.com
- Password: password

## Indexes

The schema includes indexes on frequently queried columns:
- User email
- Car type, brand, availability
- Booking dates and status

## Views

### available_cars
Lists all available cars

### active_bookings
Shows all pending and confirmed bookings with user and car details

### booking_stats
Provides aggregate statistics on bookings and revenue

## Performance Optimization

1. **Indexes**: Created on foreign keys and frequently searched columns
2. **Engine**: Using InnoDB for ACID compliance and foreign key support
3. **Charset**: UTF8MB4 for full Unicode support including emojis
4. **Cascading Deletes**: Configured to maintain referential integrity

## Backup

Create regular backups using:

```bash
mysqldump -u root -p selfcar_db > backup_$(date +%Y%m%d).sql
```

## Restore from Backup

```bash
mysql -u root -p selfcar_db < backup_20240101.sql
```

## Schema Diagram

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ first_name  │
│ last_name   │
│ email       │
│ phone       │
│ password    │
│ role        │
│ active      │
└─────┬───────┘
      │
      │ 1:N
      │
┌─────▼───────┐      ┌─────────────┐
│  bookings   │ N:1  │    cars     │
├─────────────┤◄─────┤─────────────┤
│ id (PK)     │      │ id (PK)     │
│ user_id(FK) │      │ name        │
│ car_id (FK) │      │ brand       │
│ start_date  │      │ type        │
│ end_date    │      │ year        │
│ total_price │      │ price/day   │
│ status      │      │ seats       │
└─────────────┘      │ transmission│
                     │ fuel_type   │
                     │ available   │
                     └─────────────┘
```

## Migration Strategy

When updating the schema:

1. Create a migration SQL file
2. Test in development environment
3. Backup production database
4. Apply migration during maintenance window
5. Verify data integrity

## Monitoring

Monitor these metrics:
- Query performance (slow queries)
- Table sizes and growth
- Index usage
- Connection pool statistics

