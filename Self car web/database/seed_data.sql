-- Sample Data for SelfCar Database
USE selfcar_db;

-- Insert Admin User (password: admin123)
INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES
('Admin', 'User', 'admin@selfcar.com', '+1-555-0001', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', 'ADMIN');

-- Insert Sample Customers (password: password)
INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES
('John', 'Doe', 'john.doe@example.com', '+1-555-0101', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER'),
('Jane', 'Smith', 'jane.smith@example.com', '+1-555-0102', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER'),
('Mike', 'Johnson', 'mike.johnson@example.com', '+1-555-0103', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER');

-- Insert Sample Cars
INSERT INTO cars (name, brand, type, year, price_per_day, seats, transmission, fuel_type, description, image_url, available, featured) VALUES
-- Sedans
('Camry LE', 'Toyota', 'SEDAN', 2023, 65.00, 5, 'AUTOMATIC', 'PETROL', 'Reliable and comfortable mid-size sedan perfect for family trips.', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb', TRUE, TRUE),
('Accord Sport', 'Honda', 'SEDAN', 2023, 70.00, 5, 'AUTOMATIC', 'PETROL', 'Sporty sedan with excellent fuel efficiency and modern features.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588', TRUE, FALSE),
('Model 3', 'Tesla', 'SEDAN', 2023, 120.00, 5, 'AUTOMATIC', 'ELECTRIC', 'Premium electric sedan with autopilot and long range.', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89', TRUE, TRUE),

-- SUVs
('RAV4 Adventure', 'Toyota', 'SUV', 2023, 85.00, 5, 'AUTOMATIC', 'HYBRID', 'Versatile hybrid SUV perfect for adventures and city driving.', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b', TRUE, TRUE),
('CR-V EX', 'Honda', 'SUV', 2023, 80.00, 5, 'AUTOMATIC', 'PETROL', 'Spacious SUV with advanced safety features and comfort.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf', TRUE, FALSE),
('Model X', 'Tesla', 'SUV', 2023, 150.00, 7, 'AUTOMATIC', 'ELECTRIC', 'Luxury electric SUV with falcon wing doors and premium interior.', 'https://images.unsplash.com/photo-1617788138017-80ad40651399', TRUE, FALSE),

-- Sports Cars
('Mustang GT', 'Ford', 'SPORTS', 2023, 120.00, 4, 'MANUAL', 'PETROL', 'Iconic American muscle car with powerful V8 engine.', 'https://images.unsplash.com/photo-1584345604476-8ec5f82d2e44', TRUE, TRUE),
('Corvette Stingray', 'Chevrolet', 'SPORTS', 2023, 180.00, 2, 'AUTOMATIC', 'PETROL', 'High-performance sports car with stunning design.', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d', TRUE, FALSE),

-- Luxury Cars
('S-Class', 'Mercedes-Benz', 'LUXURY', 2023, 200.00, 5, 'AUTOMATIC', 'PETROL', 'Ultimate luxury sedan with cutting-edge technology.', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8', TRUE, TRUE),
('7 Series', 'BMW', 'LUXURY', 2023, 190.00, 5, 'AUTOMATIC', 'DIESEL', 'Sophisticated luxury sedan with exceptional comfort.', 'https://images.unsplash.com/photo-1555215695-3004980ad54e', TRUE, FALSE),

-- Vans
('Odyssey Elite', 'Honda', 'VAN', 2023, 95.00, 8, 'AUTOMATIC', 'PETROL', 'Family-friendly minivan with versatile seating and entertainment.', 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c', TRUE, FALSE),
('Pacifica Hybrid', 'Chrysler', 'VAN', 2023, 105.00, 7, 'AUTOMATIC', 'HYBRID', 'Hybrid minivan with premium features and efficiency.', 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644', TRUE, FALSE);

-- Insert Sample Bookings
INSERT INTO bookings (user_id, car_id, start_date, end_date, pickup_location, dropoff_location, total_price, status) VALUES
(2, 1, '2024-01-15', '2024-01-20', '123 Main St, New York, NY', '123 Main St, New York, NY', 325.00, 'COMPLETED'),
(2, 4, '2024-02-10', '2024-02-15', '456 Oak Ave, Los Angeles, CA', '456 Oak Ave, Los Angeles, CA', 425.00, 'COMPLETED'),
(3, 3, '2024-03-01', '2024-03-05', '789 Pine Rd, Chicago, IL', '789 Pine Rd, Chicago, IL', 480.00, 'CONFIRMED'),
(3, 7, '2024-03-20', '2024-03-23', '321 Elm St, Miami, FL', '321 Elm St, Miami, FL', 360.00, 'PENDING'),
(4, 9, '2024-04-05', '2024-04-10', '654 Maple Dr, Seattle, WA', '654 Maple Dr, Seattle, WA', 1000.00, 'PENDING');

-- Verify data
SELECT 'Users:' AS Info, COUNT(*) AS Count FROM users
UNION ALL
SELECT 'Cars:', COUNT(*) FROM cars
UNION ALL
SELECT 'Bookings:', COUNT(*) FROM bookings;

