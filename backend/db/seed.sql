-- Seed Data for AI Fleet Maintenance Scheduler
-- All dates around early 2026 timeframe

-- Default Admin User (password: admin123)
INSERT INTO users (email, password, name, role) VALUES
('admin@fleetops.com', '$2b$10$rQEY1f8rS5gGjOBNKCJOku3LRZHRMQ5jq5ZUAB5dOAlXMSVKjaXGW', 'Fleet Admin', 'admin'),
('jsmith@fleetops.com', '$2b$10$rQEY1f8rS5gGjOBNKCJOku3LRZHRMQ5jq5ZUAB5dOAlXMSVKjaXGW', 'John Smith', 'operator'),
('mgarcia@fleetops.com', '$2b$10$rQEY1f8rS5gGjOBNKCJOku3LRZHRMQ5jq5ZUAB5dOAlXMSVKjaXGW', 'Maria Garcia', 'operator'),
('rwilson@fleetops.com', '$2b$10$rQEY1f8rS5gGjOBNKCJOku3LRZHRMQ5jq5ZUAB5dOAlXMSVKjaXGW', 'Robert Wilson', 'technician')
ON CONFLICT (email) DO NOTHING;

-- Vehicles (20 vehicles: mix of trucks, buses, taxis)
INSERT INTO vehicles (vehicle_id, type, make, model, year, vin, license_plate, mileage, status, fuel_type, last_service_date, next_service_date) VALUES
('TRK-001', 'truck', 'Freightliner', 'Cascadia', 2023, '1FUJGLDR5CLBK1001', 'FL-TRK-1001', 87500, 'active', 'diesel', '2026-01-15', '2026-04-15'),
('TRK-002', 'truck', 'Peterbilt', '579', 2022, '1XPWD49X1ED2T1002', 'FL-TRK-1002', 124300, 'active', 'diesel', '2026-02-01', '2026-05-01'),
('TRK-003', 'truck', 'Kenworth', 'T680', 2024, '1XKYD49X8EJ4T1003', 'FL-TRK-1003', 45200, 'active', 'diesel', '2026-02-20', '2026-05-20'),
('TRK-004', 'truck', 'Volvo', 'VNL 860', 2023, '4V4NC9EH5EN1T1004', 'FL-TRK-1004', 98700, 'maintenance', 'diesel', '2025-12-10', '2026-03-10'),
('TRK-005', 'truck', 'Freightliner', 'M2 106', 2021, '1FVACWDT5MHAJ1005', 'FL-TRK-1005', 156800, 'active', 'diesel', '2026-01-28', '2026-04-28'),
('TRK-006', 'truck', 'Peterbilt', '389', 2022, '1XPWD49X3FD3T1006', 'FL-TRK-1006', 112400, 'active', 'diesel', '2026-03-01', '2026-06-01'),
('TRK-007', 'truck', 'Kenworth', 'W990', 2024, '1XKYD49X2GJ5T1007', 'FL-TRK-1007', 32100, 'active', 'diesel', '2026-02-15', '2026-05-15'),
('BUS-001', 'bus', 'Blue Bird', 'Vision', 2023, '1BAKFCPA5JF3B1008', 'FL-BUS-2001', 67800, 'active', 'diesel', '2026-01-20', '2026-04-20'),
('BUS-002', 'bus', 'Thomas Built', 'Saf-T-Liner C2', 2022, '4UZABRDT3MCJB1009', 'FL-BUS-2002', 89400, 'active', 'diesel', '2026-02-10', '2026-05-10'),
('BUS-003', 'bus', 'IC Bus', 'CE Series', 2024, '4DRBUC8N5KB4B1010', 'FL-BUS-2003', 28900, 'active', 'diesel', '2026-03-05', '2026-06-05'),
('BUS-004', 'bus', 'Blue Bird', 'All American', 2021, '1BAKFCPA7LF5B1011', 'FL-BUS-2004', 134500, 'maintenance', 'diesel', '2025-11-20', '2026-02-20'),
('BUS-005', 'bus', 'Thomas Built', 'Jouley', 2025, '4UZABRDT5NCJB1012', 'FL-BUS-2005', 12300, 'active', 'electric', '2026-02-28', '2026-08-28'),
('TAX-001', 'taxi', 'Toyota', 'Camry', 2024, '4T1BZ1HK5KU5T1013', 'FL-TAX-3001', 34500, 'active', 'hybrid', '2026-02-05', '2026-05-05'),
('TAX-002', 'taxi', 'Honda', 'Accord', 2023, '1HGCV1F34LA6T1014', 'FL-TAX-3002', 52800, 'active', 'gasoline', '2026-01-25', '2026-04-25'),
('TAX-003', 'taxi', 'Hyundai', 'Sonata', 2024, '5NPE34AF5LH7T1015', 'FL-TAX-3003', 28900, 'active', 'hybrid', '2026-03-10', '2026-06-10'),
('TAX-004', 'taxi', 'Toyota', 'Camry', 2023, '4T1BZ1HK7JU8T1016', 'FL-TAX-3004', 61200, 'active', 'hybrid', '2026-01-10', '2026-04-10'),
('TAX-005', 'taxi', 'Honda', 'Accord', 2024, '1HGCV1F36MA9T1017', 'FL-TAX-3005', 19800, 'active', 'gasoline', '2026-02-18', '2026-05-18'),
('TAX-006', 'taxi', 'Hyundai', 'Sonata', 2023, '5NPE34AF7MHA1018', 'FL-TAX-3006', 47600, 'inactive', 'hybrid', '2025-10-15', '2026-01-15'),
('TRK-008', 'truck', 'Volvo', 'VNR 640', 2025, '4V4NC9EH7FN2T1019', 'FL-TRK-1008', 18500, 'active', 'diesel', '2026-03-12', '2026-06-12'),
('BUS-006', 'bus', 'IC Bus', 'RE Series', 2023, '4DRBUC8N7LC5B1020', 'FL-BUS-2006', 76200, 'active', 'diesel', '2026-01-30', '2026-04-30')
ON CONFLICT (vehicle_id) DO NOTHING;

-- Drivers (18 drivers)
INSERT INTO drivers (employee_id, first_name, last_name, email, phone, license_number, license_type, license_expiry, status, hire_date, medical_card_expiry, violations, rating) VALUES
('EMP-001', 'Carlos', 'Rodriguez', 'c.rodriguez@fleetops.com', '(555) 101-0001', 'CDL-TX-90001', 'CDL-A', '2027-06-15', 'active', '2020-03-15', '2026-09-15', 0, 4.85),
('EMP-002', 'James', 'Washington', 'j.washington@fleetops.com', '(555) 101-0002', 'CDL-TX-90002', 'CDL-A', '2027-03-20', 'active', '2019-07-01', '2026-07-20', 1, 4.60),
('EMP-003', 'Priya', 'Patel', 'p.patel@fleetops.com', '(555) 101-0003', 'CDL-TX-90003', 'CDL-B', '2026-12-10', 'active', '2021-01-10', '2026-06-10', 0, 4.92),
('EMP-004', 'Michael', 'O''Brien', 'm.obrien@fleetops.com', '(555) 101-0004', 'CDL-TX-90004', 'CDL-A', '2027-09-05', 'active', '2018-11-20', '2027-03-05', 2, 4.30),
('EMP-005', 'Fatima', 'Al-Hassan', 'f.alhassan@fleetops.com', '(555) 101-0005', 'CDL-TX-90005', 'CDL-B', '2027-01-25', 'active', '2022-04-15', '2026-07-25', 0, 4.95),
('EMP-006', 'David', 'Kim', 'd.kim@fleetops.com', '(555) 101-0006', 'CDL-TX-90006', 'CDL-A', '2026-08-30', 'active', '2020-09-01', '2026-04-30', 1, 4.55),
('EMP-007', 'Sarah', 'Thompson', 's.thompson@fleetops.com', '(555) 101-0007', 'CDL-TX-90007', 'CDL-B', '2027-04-12', 'active', '2021-06-20', '2026-10-12', 0, 4.78),
('EMP-008', 'Antonio', 'Vasquez', 'a.vasquez@fleetops.com', '(555) 101-0008', 'CDL-TX-90008', 'CDL-A', '2027-07-18', 'active', '2019-02-28', '2027-01-18', 0, 4.88),
('EMP-009', 'Wei', 'Chen', 'w.chen@fleetops.com', '(555) 101-0009', 'DL-TX-80001', 'standard', '2027-05-22', 'active', '2022-08-10', '2027-05-22', 0, 4.70),
('EMP-010', 'Oluwaseun', 'Adeyemi', 'o.adeyemi@fleetops.com', '(555) 101-0010', 'DL-TX-80002', 'standard', '2026-11-14', 'active', '2023-01-05', '2026-11-14', 1, 4.45),
('EMP-011', 'Jennifer', 'Martinez', 'j.martinez@fleetops.com', '(555) 101-0011', 'DL-TX-80003', 'standard', '2027-02-08', 'active', '2022-05-18', '2027-02-08', 0, 4.82),
('EMP-012', 'Robert', 'Nguyen', 'r.nguyen@fleetops.com', '(555) 101-0012', 'CDL-TX-90009', 'CDL-A', '2027-08-25', 'on_leave', '2020-10-12', '2026-08-25', 0, 4.65),
('EMP-013', 'Amara', 'Okafor', 'a.okafor@fleetops.com', '(555) 101-0013', 'CDL-TX-90010', 'CDL-B', '2026-10-03', 'active', '2021-12-01', '2026-04-03', 0, 4.90),
('EMP-014', 'Dmitri', 'Volkov', 'd.volkov@fleetops.com', '(555) 101-0014', 'DL-TX-80004', 'standard', '2027-06-30', 'active', '2023-03-22', '2027-06-30', 0, 4.75),
('EMP-015', 'Lakshmi', 'Ramasamy', 'l.ramasamy@fleetops.com', '(555) 101-0015', 'CDL-TX-90011', 'CDL-C', '2027-04-17', 'active', '2022-07-08', '2026-10-17', 1, 4.50),
('EMP-016', 'Marcus', 'Johnson', 'm.johnson@fleetops.com', '(555) 101-0016', 'CDL-TX-90012', 'CDL-A', '2026-06-20', 'active', '2019-05-14', '2026-06-20', 3, 4.10),
('EMP-017', 'Elena', 'Popescu', 'e.popescu@fleetops.com', '(555) 101-0017', 'DL-TX-80005', 'standard', '2027-09-11', 'active', '2023-09-01', '2027-09-11', 0, 4.88),
('EMP-018', 'Tariq', 'Hassan', 't.hassan@fleetops.com', '(555) 101-0018', 'CDL-TX-90013', 'CDL-B', '2027-02-28', 'inactive', '2020-01-20', '2026-02-28', 2, 4.20)
ON CONFLICT (employee_id) DO NOTHING;

-- Maintenance Records (18 records)
INSERT INTO maintenance_records (vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, technician, notes) VALUES
(1, 'preventive', 'Regular oil change and filter replacement', 'completed', 'medium', '2026-01-15', '2026-01-15', 450.00, 'Mike Torres', 'Used Mobil Delvac synthetic 15W-40'),
(2, 'preventive', 'Full brake inspection and pad replacement', 'completed', 'high', '2026-02-01', '2026-02-02', 1850.00, 'Sarah Chen', 'Front and rear pads replaced, rotors within spec'),
(3, 'preventive', 'Transmission fluid change and inspection', 'completed', 'medium', '2026-02-20', '2026-02-20', 680.00, 'Mike Torres', 'Eaton Fuller transmission, fluid dark but no metal'),
(4, 'corrective', 'Engine coolant leak repair - water pump replacement', 'in_progress', 'critical', '2026-03-08', NULL, 2200.00, 'Jake Wilson', 'Significant coolant loss detected during pre-trip'),
(5, 'preventive', 'Annual DOT inspection preparation and service', 'completed', 'high', '2026-01-28', '2026-01-29', 1200.00, 'Sarah Chen', 'All items addressed, vehicle passed inspection'),
(6, 'predictive', 'Turbocharger inspection - unusual exhaust smoke reported', 'scheduled', 'high', '2026-03-25', NULL, 0.00, 'Jake Wilson', 'Driver reported intermittent black smoke under load'),
(7, 'preventive', 'First 30,000 mile service', 'completed', 'medium', '2026-02-15', '2026-02-15', 890.00, 'Mike Torres', 'All fluids changed, filters replaced, tire rotation'),
(8, 'corrective', 'Air conditioning compressor replacement', 'completed', 'medium', '2026-01-18', '2026-01-20', 1650.00, 'Roberto Diaz', 'Compressor seized, replaced with new unit'),
(9, 'preventive', 'Brake adjustment and safety inspection', 'completed', 'high', '2026-02-10', '2026-02-10', 520.00, 'Sarah Chen', 'All brakes adjusted, one slack adjuster replaced'),
(10, 'preventive', 'Oil change and tire rotation', 'completed', 'low', '2026-03-05', '2026-03-05', 380.00, 'Mike Torres', 'Standard maintenance, all systems normal'),
(11, 'corrective', 'Starter motor replacement', 'in_progress', 'high', '2026-03-15', NULL, 1100.00, 'Jake Wilson', 'Intermittent starting failure, starter motor failed bench test'),
(12, 'preventive', 'Battery system check and software update', 'completed', 'medium', '2026-02-28', '2026-02-28', 200.00, 'Roberto Diaz', 'Electric bus - battery health at 96%, firmware updated'),
(13, 'preventive', 'Oil change and multi-point inspection', 'completed', 'low', '2026-02-05', '2026-02-05', 85.00, 'Lisa Park', 'Hybrid system check normal'),
(14, 'corrective', 'Suspension strut replacement - front left', 'completed', 'medium', '2026-01-22', '2026-01-23', 420.00, 'Lisa Park', 'Strut was leaking, replaced with OEM part'),
(15, 'predictive', 'Wheel bearing inspection - noise reported', 'scheduled', 'medium', '2026-03-28', NULL, 0.00, 'Lisa Park', 'Driver reported humming noise at highway speed'),
(16, 'preventive', 'Full vehicle detailing and inspection', 'completed', 'low', '2026-01-10', '2026-01-10', 150.00, 'Lisa Park', 'Interior and exterior detail, no issues found'),
(17, 'preventive', 'Oil change and cabin air filter', 'completed', 'low', '2026-02-18', '2026-02-18', 95.00, 'Lisa Park', 'Standard service interval'),
(18, 'corrective', 'Catalytic converter replacement', 'completed', 'high', '2025-10-10', '2025-10-12', 1800.00, 'Lisa Park', 'Check engine light P0420, converter failed efficiency test');

-- Compliance Records (18 records)
INSERT INTO compliance_records (vehicle_id, inspection_type, inspection_date, expiry_date, status, inspector_name, inspector_license, findings, corrective_actions, dot_number) VALUES
(1, 'Annual DOT Inspection', '2025-08-15', '2026-08-15', 'valid', 'Inspector Davis', 'DOT-INS-44201', 'All items within specification', 'None required', 'DOT-2847561'),
(2, 'Annual DOT Inspection', '2025-09-10', '2026-09-10', 'valid', 'Inspector Davis', 'DOT-INS-44201', 'Minor oil seepage on engine block', 'Monitor at next service', 'DOT-2847561'),
(3, 'Annual DOT Inspection', '2026-01-20', '2027-01-20', 'valid', 'Inspector Martinez', 'DOT-INS-44305', 'All items pass', 'None required', 'DOT-2847561'),
(4, 'Annual DOT Inspection', '2025-06-12', '2026-06-12', 'valid', 'Inspector Davis', 'DOT-INS-44201', 'Brake lining at 40%, tire tread at minimum on steer axle', 'Brakes serviced, tires replaced', 'DOT-2847561'),
(5, 'Annual DOT Inspection', '2026-01-29', '2027-01-29', 'valid', 'Inspector Martinez', 'DOT-INS-44305', 'All items pass, excellent condition', 'None required', 'DOT-2847561'),
(6, 'Annual DOT Inspection', '2025-07-22', '2026-07-22', 'valid', 'Inspector Davis', 'DOT-INS-44201', 'All items within specification', 'None required', 'DOT-2847561'),
(7, 'Annual DOT Inspection', '2026-02-10', '2027-02-10', 'valid', 'Inspector Martinez', 'DOT-INS-44305', 'New vehicle, all items pass', 'None required', 'DOT-2847561'),
(8, 'School Bus Inspection', '2025-07-01', '2026-07-01', 'valid', 'Inspector Wallace', 'DOT-INS-44410', 'Emergency exits functional, all lights operational', 'None required', 'DOT-2847561'),
(9, 'School Bus Inspection', '2025-06-15', '2026-06-15', 'valid', 'Inspector Wallace', 'DOT-INS-44410', 'Stop arm mechanism slow to deploy', 'Adjusted stop arm actuator', 'DOT-2847561'),
(10, 'School Bus Inspection', '2026-01-05', '2027-01-05', 'valid', 'Inspector Wallace', 'DOT-INS-44410', 'All items pass', 'None required', 'DOT-2847561'),
(11, 'School Bus Inspection', '2025-04-20', '2026-04-20', 'expiring_soon', 'Inspector Wallace', 'DOT-INS-44410', 'Exhaust leak near manifold, rust on body panels', 'Exhaust repaired, rust treatment applied', 'DOT-2847561'),
(12, 'Annual DOT Inspection', '2026-02-15', '2027-02-15', 'valid', 'Inspector Martinez', 'DOT-INS-44305', 'Electric bus - all HV systems pass', 'None required', 'DOT-2847561'),
(13, 'Taxi Permit Inspection', '2025-11-01', '2026-11-01', 'valid', 'Inspector Lee', 'TLC-INS-55101', 'Meter calibrated, all safety equipment present', 'None required', 'TLC-98234'),
(14, 'Taxi Permit Inspection', '2025-10-15', '2026-10-15', 'valid', 'Inspector Lee', 'TLC-INS-55101', 'All items pass', 'None required', 'TLC-98234'),
(15, 'Taxi Permit Inspection', '2026-01-10', '2027-01-10', 'valid', 'Inspector Lee', 'TLC-INS-55101', 'All items pass', 'None required', 'TLC-98234'),
(16, 'Taxi Permit Inspection', '2025-08-20', '2026-08-20', 'valid', 'Inspector Lee', 'TLC-INS-55101', 'Minor windshield chip noted', 'Chip repaired', 'TLC-98234'),
(17, 'Taxi Permit Inspection', '2026-02-05', '2027-02-05', 'valid', 'Inspector Lee', 'TLC-INS-55101', 'All items pass', 'None required', 'TLC-98234'),
(18, 'Taxi Permit Inspection', '2025-05-10', '2026-03-10', 'expired', 'Inspector Lee', 'TLC-INS-55101', 'Vehicle requires re-inspection', 'Vehicle taken out of service pending inspection', 'TLC-98234');

-- Parts Inventory (20 parts)
INSERT INTO parts_inventory (part_number, name, category, quantity, min_quantity, unit_cost, supplier, location, compatible_vehicles, last_ordered, status) VALUES
('FLT-OIL-15W40', 'Mobil Delvac 15W-40 Motor Oil (1 gal)', 'fluids', 48, 20, 28.99, 'AutoZone Commercial', 'Warehouse A-1', 'All diesel trucks', '2026-02-15', 'in_stock'),
('FLT-FILT-OIL01', 'Donaldson P551807 Oil Filter', 'filters', 24, 10, 18.50, 'FleetPride', 'Warehouse A-2', 'Freightliner Cascadia, Peterbilt 579', '2026-02-15', 'in_stock'),
('FLT-FILT-AIR01', 'Donaldson P628801 Air Filter', 'filters', 12, 8, 45.00, 'FleetPride', 'Warehouse A-2', 'Freightliner Cascadia', '2026-01-20', 'in_stock'),
('FLT-BRK-PAD01', 'Meritor LKSD23511 Brake Pad Set', 'brakes', 8, 6, 185.00, 'FleetPride', 'Warehouse B-1', 'All Class 8 trucks', '2026-02-01', 'in_stock'),
('FLT-BRK-ROT01', 'Meritor 23-123571-002 Brake Rotor', 'brakes', 4, 4, 320.00, 'FleetPride', 'Warehouse B-1', 'Freightliner, Kenworth', '2026-01-10', 'low_stock'),
('FLT-BLT-SERP1', 'Gates K080830 Serpentine Belt', 'belts', 6, 4, 42.00, 'NAPA Fleet', 'Warehouse A-3', 'Freightliner Cascadia, Volvo VNL', '2026-02-20', 'in_stock'),
('FLT-COOL-DEX', 'Shell Rotella ELC Coolant (1 gal)', 'fluids', 30, 15, 22.50, 'AutoZone Commercial', 'Warehouse A-1', 'All diesel trucks and buses', '2026-03-01', 'in_stock'),
('FLT-TIRE-STR1', 'Michelin XZA3+ 295/75R22.5 Steer Tire', 'tires', 6, 4, 485.00, 'TireHub', 'Warehouse C-1', 'All Class 8 trucks', '2026-01-25', 'in_stock'),
('FLT-TIRE-DRV1', 'Michelin XDN2 295/75R22.5 Drive Tire', 'tires', 8, 6, 445.00, 'TireHub', 'Warehouse C-1', 'All Class 8 trucks', '2026-01-25', 'in_stock'),
('FLT-LAMP-HD01', 'Philips H11 LED Headlight Bulb', 'electrical', 15, 10, 35.00, 'NAPA Fleet', 'Warehouse A-4', 'All vehicles', '2026-02-10', 'in_stock'),
('FLT-FILT-FUL1', 'Racor R120T Fuel Filter/Water Separator', 'filters', 3, 8, 55.00, 'FleetPride', 'Warehouse A-2', 'All diesel trucks', '2025-12-15', 'out_of_stock'),
('FLT-STRUT-FT', 'Monroe 72365 Front Strut Assembly', 'suspension', 4, 4, 189.00, 'AutoZone Commercial', 'Warehouse B-2', 'Toyota Camry, Honda Accord', '2026-01-20', 'low_stock'),
('FLT-OIL-5W30', 'Mobil 1 5W-30 Full Synthetic (1 qt)', 'fluids', 36, 20, 9.99, 'AutoZone Commercial', 'Warehouse A-1', 'All gasoline/hybrid taxis', '2026-03-05', 'in_stock'),
('FLT-FILT-OIL2', 'Toyota 04152-YZZA1 Oil Filter', 'filters', 18, 10, 7.50, 'Toyota Parts Depot', 'Warehouse A-2', 'Toyota Camry', '2026-02-25', 'in_stock'),
('FLT-FILT-CAB1', 'Mann CUK2939 Cabin Air Filter', 'filters', 10, 8, 19.00, 'NAPA Fleet', 'Warehouse A-2', 'Toyota Camry, Honda Accord, Hyundai Sonata', '2026-02-10', 'in_stock'),
('FLT-BAT-GRP31', 'Interstate MT-31 Battery Group 31', 'electrical', 5, 4, 175.00, 'Interstate Batteries', 'Warehouse A-4', 'All Class 8 trucks', '2026-01-15', 'in_stock'),
('FLT-WIPER-24', 'Bosch Icon 24" Wiper Blade', 'body', 12, 8, 24.00, 'AutoZone Commercial', 'Warehouse A-5', 'All vehicles', '2026-03-01', 'in_stock'),
('FLT-TRANS-ATF', 'Castrol Transmax ATF (1 qt)', 'fluids', 20, 10, 12.50, 'AutoZone Commercial', 'Warehouse A-1', 'All automatic transmission vehicles', '2026-02-20', 'in_stock'),
('FLT-SLACK-ADJ', 'Haldex 40010141 Automatic Slack Adjuster', 'brakes', 2, 4, 95.00, 'FleetPride', 'Warehouse B-1', 'All Class 8 trucks', '2025-11-20', 'out_of_stock'),
('FLT-WTPUMP-DD', 'Dorman 902-5190 Water Pump', 'engine', 1, 2, 289.00, 'FleetPride', 'Warehouse B-3', 'Volvo VNL, Volvo VNR', '2026-03-08', 'low_stock')
ON CONFLICT (part_number) DO NOTHING;

-- Work Orders (18 work orders)
INSERT INTO work_orders (order_number, vehicle_id, type, description, status, priority, assigned_to, estimated_hours, actual_hours, parts_used, cost, due_date, completed_date) VALUES
('WO-2026-001', 1, 'Preventive Maintenance', 'Regular oil change and 90K mile service', 'completed', 'medium', 'Mike Torres', 2.00, 1.75, 'FLT-OIL-15W40 x3, FLT-FILT-OIL01 x1', 450.00, '2026-01-15', '2026-01-15'),
('WO-2026-002', 2, 'Brake Service', 'Full brake inspection and pad replacement all axles', 'completed', 'high', 'Sarah Chen', 6.00, 7.50, 'FLT-BRK-PAD01 x3', 1850.00, '2026-02-02', '2026-02-02'),
('WO-2026-003', 3, 'Preventive Maintenance', 'Transmission fluid change at 45K miles', 'completed', 'medium', 'Mike Torres', 3.00, 2.50, 'FLT-TRANS-ATF x12', 680.00, '2026-02-20', '2026-02-20'),
('WO-2026-004', 4, 'Emergency Repair', 'Water pump failure - engine overheating', 'in_progress', 'critical', 'Jake Wilson', 8.00, NULL, 'FLT-WTPUMP-DD x1, FLT-COOL-DEX x4', 2200.00, '2026-03-10', NULL),
('WO-2026-005', 5, 'DOT Inspection Prep', 'Annual DOT inspection preparation and service', 'completed', 'high', 'Sarah Chen', 5.00, 4.50, 'FLT-LAMP-HD01 x2, FLT-FILT-AIR01 x1', 1200.00, '2026-01-29', '2026-01-29'),
('WO-2026-006', 6, 'Diagnostic', 'Turbocharger diagnostic - exhaust smoke', 'open', 'high', 'Jake Wilson', 4.00, NULL, NULL, 0.00, '2026-03-25', NULL),
('WO-2026-007', 7, 'Preventive Maintenance', '30,000 mile comprehensive service', 'completed', 'medium', 'Mike Torres', 4.00, 3.50, 'FLT-OIL-15W40 x3, FLT-FILT-OIL01 x1, FLT-FILT-AIR01 x1', 890.00, '2026-02-15', '2026-02-15'),
('WO-2026-008', 8, 'AC Repair', 'Air conditioning compressor replacement', 'completed', 'medium', 'Roberto Diaz', 5.00, 6.00, NULL, 1650.00, '2026-01-20', '2026-01-20'),
('WO-2026-009', 9, 'Brake Service', 'Brake adjustment and slack adjuster replacement', 'completed', 'high', 'Sarah Chen', 3.00, 2.75, 'FLT-SLACK-ADJ x1', 520.00, '2026-02-10', '2026-02-10'),
('WO-2026-010', 10, 'Preventive Maintenance', 'Oil change and tire rotation', 'completed', 'low', 'Mike Torres', 2.00, 1.50, NULL, 380.00, '2026-03-05', '2026-03-05'),
('WO-2026-011', 11, 'Starter Repair', 'Starter motor diagnostic and replacement', 'in_progress', 'high', 'Jake Wilson', 4.00, NULL, NULL, 1100.00, '2026-03-17', NULL),
('WO-2026-012', 12, 'EV Service', 'Battery health check and software update', 'completed', 'medium', 'Roberto Diaz', 2.00, 1.50, NULL, 200.00, '2026-02-28', '2026-02-28'),
('WO-2026-013', 13, 'Preventive Maintenance', 'Oil change and multi-point inspection', 'completed', 'low', 'Lisa Park', 1.50, 1.25, 'FLT-OIL-5W30 x5, FLT-FILT-OIL2 x1', 85.00, '2026-02-05', '2026-02-05'),
('WO-2026-014', 14, 'Suspension Repair', 'Front left strut replacement', 'completed', 'medium', 'Lisa Park', 3.00, 2.75, 'FLT-STRUT-FT x1', 420.00, '2026-01-23', '2026-01-23'),
('WO-2026-015', 15, 'Diagnostic', 'Wheel bearing noise investigation', 'open', 'medium', 'Lisa Park', 2.00, NULL, NULL, 0.00, '2026-03-28', NULL),
('WO-2026-016', 19, 'Preventive Maintenance', 'First 15K mile service for new truck', 'completed', 'medium', 'Mike Torres', 2.50, 2.00, 'FLT-OIL-15W40 x3, FLT-FILT-OIL01 x1', 520.00, '2026-03-12', '2026-03-12'),
('WO-2026-017', 20, 'Preventive Maintenance', 'Regular service and DOT prep', 'open', 'high', 'Sarah Chen', 5.00, NULL, NULL, 0.00, '2026-04-01', NULL),
('WO-2026-018', 16, 'Tire Service', 'All four tires replacement - worn to minimum tread', 'on_hold', 'medium', 'Lisa Park', 2.00, NULL, NULL, 600.00, '2026-03-20', NULL)
ON CONFLICT (order_number) DO NOTHING;

-- Driver Assignments (16 assignments)
INSERT INTO driver_assignments (driver_id, vehicle_id, start_date, end_date, shift, route, status, notes) VALUES
(1, 1, '2026-01-01', NULL, 'day', 'Dallas-Houston I-45 Corridor', 'active', 'Primary long-haul route'),
(2, 2, '2026-01-01', NULL, 'day', 'Dallas-San Antonio I-35 Corridor', 'active', 'Primary long-haul route'),
(3, 8, '2026-01-01', NULL, 'day', 'School District 14 - Morning/Afternoon Routes', 'active', 'School bus route AM/PM'),
(4, 3, '2026-01-15', NULL, 'night', 'DFW Metroplex Regional Delivery', 'active', 'Night shift regional'),
(5, 9, '2026-01-01', NULL, 'day', 'School District 14 - Route B', 'active', 'School bus route AM/PM'),
(6, 5, '2026-01-01', NULL, 'rotating', 'Houston-El Paso I-10 Corridor', 'active', 'Long-haul with rotating schedule'),
(7, 10, '2026-02-01', NULL, 'day', 'School District 22 - Route A', 'active', 'New route assignment'),
(8, 6, '2026-01-01', NULL, 'day', 'Dallas-Oklahoma City I-35 North', 'active', 'Interstate corridor'),
(9, 13, '2026-01-01', NULL, 'day', 'Downtown Dallas Taxi Zone', 'active', 'Taxi - downtown area'),
(10, 14, '2026-01-01', NULL, 'night', 'DFW Airport Taxi Service', 'active', 'Airport runs - night shift'),
(11, 15, '2026-01-15', NULL, 'day', 'Uptown Dallas Taxi Zone', 'active', 'Taxi - uptown/highland park'),
(13, 20, '2026-02-01', NULL, 'day', 'School District 22 - Route C', 'active', 'Bus route assignment'),
(14, 16, '2026-01-01', NULL, 'rotating', 'Fort Worth Taxi Service', 'active', 'Rotating taxi shifts'),
(15, 7, '2026-02-15', NULL, 'day', 'DFW Regional Freight', 'active', 'Regional freight hauling'),
(16, 4, '2025-10-01', '2026-03-08', 'day', 'Dallas-Little Rock I-30', 'completed', 'Vehicle moved to maintenance'),
(17, 17, '2026-02-01', NULL, 'day', 'Plano Taxi Service', 'active', 'Suburban taxi service')
ON CONFLICT DO NOTHING;

-- Fuel Records (20 records)
INSERT INTO fuel_records (vehicle_id, driver_id, date, gallons, cost_per_gallon, total_cost, odometer_reading, fuel_type, station, city, state, mpg) VALUES
(1, 1, '2026-03-10', 120.50, 3.85, 463.93, 87500, 'diesel', 'Pilot Travel Center #412', 'Waco', 'TX', 6.2),
(1, 1, '2026-03-03', 115.00, 3.82, 439.30, 86750, 'diesel', 'Love''s Travel Stop #247', 'Dallas', 'TX', 6.5),
(2, 2, '2026-03-12', 130.00, 3.89, 505.70, 124300, 'diesel', 'TA Travel Center #198', 'Waco', 'TX', 5.8),
(2, 2, '2026-03-05', 125.50, 3.84, 481.92, 123550, 'diesel', 'Pilot Travel Center #305', 'Temple', 'TX', 6.0),
(3, 4, '2026-03-14', 98.00, 3.87, 379.26, 45200, 'diesel', 'Love''s Travel Stop #189', 'Arlington', 'TX', 6.8),
(5, 6, '2026-03-11', 145.00, 3.91, 566.95, 156800, 'diesel', 'Pilot Travel Center #561', 'Van Horn', 'TX', 5.5),
(5, 6, '2026-03-04', 140.00, 3.86, 540.40, 155950, 'diesel', 'TA Travel Center #322', 'Fort Stockton', 'TX', 5.7),
(6, 8, '2026-03-13', 110.00, 3.88, 426.80, 112400, 'diesel', 'Love''s Travel Stop #301', 'Ardmore', 'OK', 6.1),
(7, 15, '2026-03-15', 85.00, 3.90, 331.50, 32100, 'diesel', 'Pilot Travel Center #412', 'Dallas', 'TX', 7.0),
(8, 3, '2026-03-10', 45.00, 3.92, 176.40, 67800, 'diesel', 'Shell Station #4421', 'Plano', 'TX', 8.5),
(9, 5, '2026-03-12', 48.00, 3.88, 186.24, 89400, 'diesel', 'Chevron Station #2201', 'Dallas', 'TX', 8.2),
(10, 7, '2026-03-08', 42.00, 3.85, 161.70, 28900, 'diesel', 'Shell Station #4422', 'Richardson', 'TX', 9.0),
(13, 9, '2026-03-15', 10.50, 3.45, 36.23, 34500, 'regular', 'Exxon Station #1102', 'Dallas', 'TX', 42.0),
(13, 9, '2026-03-08', 11.00, 3.42, 37.62, 34050, 'regular', 'Shell Station #3301', 'Dallas', 'TX', 40.5),
(14, 10, '2026-03-14', 12.80, 3.55, 45.44, 52800, 'regular', 'Chevron Station #1501', 'Irving', 'TX', 32.0),
(15, 11, '2026-03-12', 9.50, 3.48, 33.06, 28900, 'regular', 'Exxon Station #1103', 'Dallas', 'TX', 44.0),
(16, 14, '2026-03-10', 11.20, 3.52, 39.42, 61200, 'regular', 'Shell Station #3302', 'Fort Worth', 'TX', 38.0),
(17, 17, '2026-03-13', 10.00, 3.49, 34.90, 19800, 'regular', 'Exxon Station #1104', 'Plano', 'TX', 35.0),
(19, NULL, '2026-03-16', 95.00, 3.92, 372.40, 18500, 'diesel', 'Pilot Travel Center #412', 'Dallas', 'TX', 7.2),
(20, 13, '2026-03-09', 50.00, 3.88, 194.00, 76200, 'diesel', 'Shell Station #4423', 'McKinney', 'TX', 8.0)
ON CONFLICT DO NOTHING;

-- Downtime Records (16 records)
INSERT INTO downtime_records (vehicle_id, reason, start_date, end_date, duration_hours, impact, cost_impact, resolution, preventable, category) VALUES
(4, 'Water pump failure causing engine overheating', '2026-03-08 06:30:00', NULL, NULL, 'critical', 3500.00, NULL, true, 'mechanical'),
(11, 'Starter motor failure - unable to start', '2026-03-14 05:45:00', NULL, NULL, 'high', 1800.00, NULL, false, 'electrical'),
(18, 'Failed taxi inspection - taken out of service', '2026-01-15 08:00:00', NULL, NULL, 'medium', 2400.00, NULL, true, 'scheduled'),
(2, 'Brake pad replacement - scheduled maintenance', '2026-02-01 07:00:00', '2026-02-02 16:00:00', 33.00, 'medium', 1850.00, 'Full brake service completed', false, 'scheduled'),
(8, 'AC compressor failure during route', '2026-01-17 14:00:00', '2026-01-20 11:00:00', 69.00, 'medium', 1650.00, 'Compressor replaced', false, 'mechanical'),
(14, 'Suspension strut leak - rough ride reported', '2026-01-21 08:00:00', '2026-01-23 15:00:00', 55.00, 'low', 420.00, 'Front left strut replaced', false, 'mechanical'),
(1, 'Scheduled oil change and service', '2026-01-15 07:00:00', '2026-01-15 12:00:00', 5.00, 'low', 450.00, 'Service completed on schedule', false, 'scheduled'),
(5, 'DOT inspection preparation and service', '2026-01-28 07:00:00', '2026-01-29 17:00:00', 34.00, 'medium', 1200.00, 'Passed DOT inspection', false, 'scheduled'),
(3, 'Transmission service', '2026-02-20 07:00:00', '2026-02-20 14:00:00', 7.00, 'low', 680.00, 'Transmission fluid changed', false, 'scheduled'),
(9, 'Brake adjustment and repair', '2026-02-10 07:00:00', '2026-02-10 14:30:00', 7.50, 'medium', 520.00, 'Brakes adjusted, slack adjuster replaced', false, 'mechanical'),
(6, 'Flat tire on I-35 - roadside repair', '2026-02-25 10:15:00', '2026-02-25 14:30:00', 4.25, 'high', 650.00, 'Tire replaced by roadside assistance', true, 'tire'),
(16, 'Minor fender bender in parking lot', '2026-03-01 09:00:00', '2026-03-05 16:00:00', 103.00, 'low', 1200.00, 'Body repair completed', true, 'body'),
(7, 'Scheduled 30K service', '2026-02-15 07:00:00', '2026-02-15 15:00:00', 8.00, 'low', 890.00, 'Full service completed', false, 'scheduled'),
(10, 'Oil change and tire rotation', '2026-03-05 07:00:00', '2026-03-05 10:30:00', 3.50, 'low', 380.00, 'Service completed', false, 'scheduled'),
(12, 'Software update and battery diagnostics', '2026-02-28 08:00:00', '2026-02-28 12:00:00', 4.00, 'low', 200.00, 'Software updated, battery at 96% health', false, 'electrical'),
(15, 'Wheel bearing noise investigation pending', '2026-03-18 07:00:00', NULL, NULL, 'medium', 0.00, NULL, false, 'mechanical')
ON CONFLICT DO NOTHING;

-- Maintenance Schedule (18 scheduled items)
INSERT INTO maintenance_schedule (vehicle_id, service_type, frequency_miles, frequency_days, last_performed, next_due, estimated_cost, priority, status, assigned_shop, notes) VALUES
(1, 'Oil Change & Filter', 15000, 90, '2026-01-15', '2026-04-15', 450.00, 'medium', 'upcoming', 'Main Fleet Shop', 'Use Mobil Delvac 15W-40'),
(2, 'Oil Change & Filter', 15000, 90, '2026-02-01', '2026-05-01', 450.00, 'medium', 'upcoming', 'Main Fleet Shop', NULL),
(3, 'Oil Change & Filter', 15000, 90, '2026-02-20', '2026-05-20', 450.00, 'medium', 'upcoming', 'Main Fleet Shop', NULL),
(4, 'Engine Coolant System Service', NULL, 365, '2025-12-10', '2026-03-10', 800.00, 'high', 'overdue', 'Main Fleet Shop', 'Overdue - vehicle currently in repair'),
(5, 'Tire Inspection & Rotation', 25000, 120, '2026-01-28', '2026-05-28', 200.00, 'medium', 'upcoming', 'TireHub Dallas', NULL),
(6, 'Turbocharger Inspection', NULL, 180, NULL, '2026-03-25', 350.00, 'high', 'upcoming', 'Main Fleet Shop', 'Exhaust smoke reported'),
(7, 'Oil Change & Filter', 15000, 90, '2026-02-15', '2026-05-15', 450.00, 'medium', 'upcoming', 'Main Fleet Shop', NULL),
(8, 'Brake Inspection', NULL, 180, '2026-01-20', '2026-07-20', 300.00, 'medium', 'upcoming', 'Bus Maintenance Center', NULL),
(9, 'Full Service & Safety Check', NULL, 90, '2026-02-10', '2026-05-10', 600.00, 'high', 'upcoming', 'Bus Maintenance Center', NULL),
(10, 'Oil Change & Inspection', 10000, 90, '2026-03-05', '2026-06-05', 380.00, 'medium', 'upcoming', 'Bus Maintenance Center', NULL),
(11, 'Starter System Full Diagnostic', NULL, NULL, NULL, '2026-03-20', 500.00, 'high', 'overdue', 'Bus Maintenance Center', 'Starter failure under repair'),
(12, 'Battery Health Check', NULL, 180, '2026-02-28', '2026-08-28', 200.00, 'medium', 'upcoming', 'EV Service Center', 'Electric bus - specialized service required'),
(13, 'Oil Change & Hybrid System Check', 5000, 90, '2026-02-05', '2026-05-05', 95.00, 'low', 'upcoming', 'Toyota Dealer Service', NULL),
(14, 'Oil Change & Inspection', 5000, 90, '2026-01-25', '2026-04-25', 85.00, 'low', 'upcoming', 'Honda Dealer Service', NULL),
(15, 'Wheel Bearing Service', NULL, NULL, NULL, '2026-03-28', 350.00, 'medium', 'upcoming', 'Main Fleet Shop', 'Noise investigation scheduled'),
(16, 'Tire Replacement', NULL, NULL, '2026-01-10', '2026-03-20', 600.00, 'medium', 'overdue', 'TireHub Dallas', 'Tires at minimum tread depth'),
(19, 'Oil Change & Filter', 15000, 90, '2026-03-12', '2026-06-12', 450.00, 'medium', 'upcoming', 'Main Fleet Shop', 'New truck - follow break-in schedule'),
(20, 'DOT Inspection Prep', NULL, 365, '2026-01-30', '2026-04-30', 800.00, 'high', 'upcoming', 'Bus Maintenance Center', NULL)
ON CONFLICT DO NOTHING;

-- Cost Records (20 cost records)
INSERT INTO cost_records (vehicle_id, category, description, amount, date, vendor, invoice_number, payment_status, recurring, notes) VALUES
(1, 'maintenance', 'Oil change and 90K mile service', 450.00, '2026-01-15', 'Main Fleet Shop', 'INV-2026-0101', 'paid', false, NULL),
(2, 'maintenance', 'Full brake service - all axles', 1850.00, '2026-02-02', 'Main Fleet Shop', 'INV-2026-0115', 'paid', false, NULL),
(3, 'maintenance', 'Transmission fluid change', 680.00, '2026-02-20', 'Main Fleet Shop', 'INV-2026-0128', 'paid', false, NULL),
(4, 'maintenance', 'Water pump replacement and coolant', 2200.00, '2026-03-08', 'Main Fleet Shop', 'INV-2026-0145', 'pending', false, 'Repair in progress'),
(5, 'maintenance', 'DOT inspection prep and service', 1200.00, '2026-01-29', 'Main Fleet Shop', 'INV-2026-0108', 'paid', false, NULL),
(1, 'fuel', 'Monthly fuel - January 2026', 1842.50, '2026-01-31', 'Various fuel stations', NULL, 'paid', true, 'Monthly fuel aggregate'),
(2, 'fuel', 'Monthly fuel - January 2026', 2105.30, '2026-01-31', 'Various fuel stations', NULL, 'paid', true, 'Monthly fuel aggregate'),
(1, 'insurance', 'Commercial vehicle insurance - Q1 2026', 2800.00, '2026-01-01', 'Progressive Commercial', 'POL-CVH-90001', 'paid', true, 'Quarterly premium'),
(2, 'insurance', 'Commercial vehicle insurance - Q1 2026', 2800.00, '2026-01-01', 'Progressive Commercial', 'POL-CVH-90002', 'paid', true, 'Quarterly premium'),
(8, 'maintenance', 'AC compressor replacement', 1650.00, '2026-01-20', 'Bus Maintenance Center', 'INV-2026-0110', 'paid', false, NULL),
(13, 'registration', 'Taxi permit renewal 2026', 350.00, '2025-11-01', 'City of Dallas TLC', 'TLC-REN-2026-001', 'paid', true, 'Annual renewal'),
(14, 'registration', 'Taxi permit renewal 2026', 350.00, '2025-10-15', 'City of Dallas TLC', 'TLC-REN-2026-002', 'paid', true, 'Annual renewal'),
(6, 'tires', 'Roadside tire replacement', 650.00, '2026-02-25', 'TireHub Dallas', 'INV-TH-2026-042', 'paid', false, 'Emergency roadside service'),
(16, 'maintenance', 'Fender repair after parking lot incident', 1200.00, '2026-03-05', 'AutoBody Works Dallas', 'INV-ABW-2026-018', 'paid', false, NULL),
(7, 'maintenance', '30,000 mile comprehensive service', 890.00, '2026-02-15', 'Main Fleet Shop', 'INV-2026-0125', 'paid', false, NULL),
(12, 'maintenance', 'Battery diagnostics and software update', 200.00, '2026-02-28', 'EV Service Center', 'INV-EV-2026-003', 'paid', false, NULL),
(14, 'maintenance', 'Front strut replacement', 420.00, '2026-01-23', 'Honda Dealer Service', 'INV-HD-2026-011', 'paid', false, NULL),
(5, 'fuel', 'Monthly fuel - February 2026', 2250.80, '2026-02-28', 'Various fuel stations', NULL, 'paid', true, 'Monthly fuel aggregate'),
(3, 'insurance', 'Commercial vehicle insurance - Q1 2026', 2600.00, '2026-01-01', 'Progressive Commercial', 'POL-CVH-90003', 'paid', true, 'Quarterly premium'),
(9, 'maintenance', 'Brake adjustment and slack adjuster', 520.00, '2026-02-10', 'Bus Maintenance Center', 'INV-2026-0120', 'paid', false, NULL)
ON CONFLICT DO NOTHING;

-- Alerts (18 alerts)
INSERT INTO alerts (vehicle_id, type, severity, title, message, status, due_date) VALUES
(4, 'maintenance_due', 'critical', 'Emergency Repair Required - TRK-004', 'Vehicle TRK-004 (Volvo VNL 860) has water pump failure and is currently out of service. Repair in progress.', 'active', '2026-03-10'),
(11, 'maintenance_due', 'high', 'Starter Motor Repair Needed - BUS-004', 'Vehicle BUS-004 (Blue Bird All American) has intermittent starting failure. Starter motor replacement in progress.', 'active', '2026-03-17'),
(6, 'maintenance_due', 'high', 'Turbocharger Inspection Due - TRK-006', 'Vehicle TRK-006 (Peterbilt 389) requires turbocharger inspection. Black exhaust smoke reported by driver.', 'active', '2026-03-25'),
(18, 'compliance_expiring', 'critical', 'Taxi Permit Expired - TAX-006', 'Vehicle TAX-006 (Hyundai Sonata) taxi permit has expired. Vehicle must not operate until re-inspected.', 'active', '2026-03-10'),
(11, 'compliance_expiring', 'high', 'School Bus Inspection Expiring Soon - BUS-004', 'Vehicle BUS-004 school bus inspection expires on 2026-04-20. Schedule re-inspection.', 'active', '2026-04-20'),
(NULL, 'part_low_stock', 'high', 'Fuel Filter Out of Stock', 'Part FLT-FILT-FUL1 (Racor R120T Fuel Filter) is out of stock. Current: 3, Minimum: 8. Reorder immediately.', 'active', NULL),
(NULL, 'part_low_stock', 'high', 'Slack Adjusters Out of Stock', 'Part FLT-SLACK-ADJ (Haldex Automatic Slack Adjuster) is out of stock. Current: 2, Minimum: 4.', 'active', NULL),
(NULL, 'part_low_stock', 'medium', 'Brake Rotors Low Stock', 'Part FLT-BRK-ROT01 (Meritor Brake Rotor) is at minimum stock level. Current: 4, Minimum: 4.', 'active', NULL),
(NULL, 'part_low_stock', 'medium', 'Water Pump Low Stock', 'Part FLT-WTPUMP-DD (Dorman Water Pump) is below minimum. Current: 1, Minimum: 2. Used for current repair.', 'active', NULL),
(NULL, 'driver_license_expiring', 'high', 'CDL Expiring Soon - Marcus Johnson', 'Driver Marcus Johnson (EMP-016) CDL expires on 2026-06-20. Initiate renewal process.', 'active', '2026-06-20'),
(NULL, 'driver_license_expiring', 'medium', 'CDL Expiring - David Kim', 'Driver David Kim (EMP-006) CDL expires on 2026-08-30. Schedule renewal.', 'active', '2026-08-30'),
(15, 'maintenance_due', 'medium', 'Wheel Bearing Inspection Scheduled - TAX-003', 'Vehicle TAX-003 (Hyundai Sonata) has wheel bearing noise. Inspection scheduled for 2026-03-28.', 'active', '2026-03-28'),
(16, 'maintenance_due', 'medium', 'Tire Replacement Overdue - TAX-004', 'Vehicle TAX-004 (Toyota Camry) tire replacement is overdue. Tires at minimum tread depth.', 'active', '2026-03-20'),
(4, 'maintenance_due', 'high', 'Coolant System Service Overdue - TRK-004', 'Vehicle TRK-004 scheduled coolant system service is overdue since 2026-03-10.', 'active', '2026-03-10'),
(1, 'maintenance_due', 'low', 'Upcoming Service - TRK-001', 'Vehicle TRK-001 (Freightliner Cascadia) next service due on 2026-04-15. Schedule appointment.', 'active', '2026-04-15'),
(2, 'maintenance_due', 'low', 'Upcoming Service - TRK-002', 'Vehicle TRK-002 (Peterbilt 579) next service due on 2026-05-01.', 'active', '2026-05-01'),
(NULL, 'part_low_stock', 'medium', 'Front Strut Assembly Low Stock', 'Part FLT-STRUT-FT (Monroe Front Strut) is at minimum level. Current: 4, Minimum: 4.', 'active', NULL),
(5, 'maintenance_due', 'low', 'Tire Rotation Due - TRK-005', 'Vehicle TRK-005 (Freightliner M2 106) tire rotation due at next service interval.', 'acknowledged', '2026-05-28')
ON CONFLICT DO NOTHING;

-- Tires (18 records)
INSERT INTO tires (vehicle_id, position, brand, model, size, dot_code, install_date, mileage_at_install, tread_depth, max_tread_depth, pressure_psi, recommended_psi, condition, status, notes) VALUES
(1, 'LF', 'Michelin', 'XZA3+', '295/75R22.5', 'DOT HAEX LMLR 2024', '2025-06-15', 62000, 8.50, 11.0, 105.0, 110.0, 'good', 'active', 'Steer axle left'),
(1, 'RF', 'Michelin', 'XZA3+', '295/75R22.5', 'DOT HAEX LMLR 2024', '2025-06-15', 62000, 8.20, 11.0, 105.0, 110.0, 'good', 'active', 'Steer axle right'),
(1, 'LRO', 'Michelin', 'XDN2', '295/75R22.5', 'DOT HAEX KMPR 2023', '2024-11-01', 45000, 6.50, 11.0, 100.0, 100.0, 'fair', 'active', 'Left rear outer'),
(1, 'LRI', 'Michelin', 'XDN2', '295/75R22.5', 'DOT HAEX KMPR 2023', '2024-11-01', 45000, 6.80, 11.0, 100.0, 100.0, 'fair', 'active', 'Left rear inner'),
(2, 'LF', 'Goodyear', 'Fuel Max RSA', '295/75R22.5', 'DOT DNBV JMTX 2023', '2025-03-10', 85000, 5.20, 11.0, 108.0, 110.0, 'worn', 'active', 'Approaching replacement'),
(2, 'RF', 'Goodyear', 'Fuel Max RSA', '295/75R22.5', 'DOT DNBV JMTX 2023', '2025-03-10', 85000, 5.50, 11.0, 107.0, 110.0, 'worn', 'active', 'Approaching replacement'),
(3, 'LF', 'Bridgestone', 'R283A Ecopia', '295/75R22.5', 'DOT UJHP NRTW 2024', '2025-09-20', 30000, 9.80, 11.0, 110.0, 110.0, 'good', 'active', NULL),
(3, 'RF', 'Bridgestone', 'R283A Ecopia', '295/75R22.5', 'DOT UJHP NRTW 2024', '2025-09-20', 30000, 9.60, 11.0, 110.0, 110.0, 'good', 'active', NULL),
(5, 'LF', 'Continental', 'Conti HSL3', '295/75R22.5', 'DOT PBCJ LKWM 2022', '2024-05-10', 100000, 3.80, 11.0, 102.0, 110.0, 'critical', 'active', 'Needs replacement soon'),
(5, 'RF', 'Continental', 'Conti HSL3', '295/75R22.5', 'DOT PBCJ LKWM 2022', '2024-05-10', 100000, 4.10, 11.0, 103.0, 110.0, 'worn', 'active', 'Needs replacement soon'),
(6, 'LF', 'Michelin', 'XZA3+', '295/75R22.5', 'DOT HAEX RSNW 2024', '2025-08-01', 90000, 7.90, 11.0, 109.0, 110.0, 'good', 'active', NULL),
(6, 'RF', 'Michelin', 'XZA3+', '295/75R22.5', 'DOT HAEX RSNW 2024', '2025-08-01', 90000, 7.70, 11.0, 108.0, 110.0, 'good', 'active', NULL),
(13, 'LF', 'Michelin', 'Defender T+H', '215/55R17', 'DOT HAEX MPQW 2024', '2025-10-01', 25000, 9.00, 10.0, 35.0, 35.0, 'good', 'active', NULL),
(13, 'RF', 'Michelin', 'Defender T+H', '215/55R17', 'DOT HAEX MPQW 2024', '2025-10-01', 25000, 8.80, 10.0, 35.0, 35.0, 'good', 'active', NULL),
(13, 'LR', 'Michelin', 'Defender T+H', '215/55R17', 'DOT HAEX MPQW 2024', '2025-10-01', 25000, 9.20, 10.0, 35.0, 35.0, 'good', 'active', NULL),
(13, 'RR', 'Michelin', 'Defender T+H', '215/55R17', 'DOT HAEX MPQW 2024', '2025-10-01', 25000, 9.10, 10.0, 35.0, 35.0, 'good', 'active', NULL),
(16, 'LF', 'Goodyear', 'Assurance MaxLife', '215/55R17', 'DOT DNBV HKTW 2022', '2023-08-15', 15000, 2.50, 10.0, 30.0, 35.0, 'critical', 'needs_replacement', 'Below minimum tread depth'),
(16, 'RF', 'Goodyear', 'Assurance MaxLife', '215/55R17', 'DOT DNBV HKTW 2022', '2023-08-15', 15000, 2.80, 10.0, 31.0, 35.0, 'critical', 'needs_replacement', 'Below minimum tread depth')
ON CONFLICT DO NOTHING;

-- Inspections (18 DVIR records)
INSERT INTO inspections (vehicle_id, driver_id, inspection_type, date, time, odometer, overall_status, brakes, tires_check, lights, fluids, engine, transmission, steering, exhaust, body_exterior, safety_equipment, defects_found, corrective_action, inspector_signature, status) VALUES
(1, 1, 'pre_trip', '2026-03-18', '05:30:00', 87500, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Carlos Rodriguez', 'completed'),
(1, 1, 'post_trip', '2026-03-18', '18:45:00', 87820, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Carlos Rodriguez', 'completed'),
(2, 2, 'pre_trip', '2026-03-18', '06:00:00', 124300, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'James Washington', 'completed'),
(3, 4, 'pre_trip', '2026-03-17', '20:00:00', 45200, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Michael O''Brien', 'completed'),
(4, NULL, 'pre_trip', '2026-03-07', '06:15:00', 98700, 'fail', 'ok', 'ok', 'ok', 'defect', 'defect', 'ok', 'ok', 'ok', 'ok', 'ok', 'Coolant leak detected under vehicle. Engine temperature gauge reading high.', 'Vehicle taken out of service. Water pump replacement scheduled.', 'Marcus Johnson', 'completed'),
(5, 6, 'pre_trip', '2026-03-17', '05:45:00', 156800, 'pass', 'ok', 'minor', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'Steer tires showing wear', 'Monitor tread depth, schedule replacement within 30 days', 'David Kim', 'completed'),
(6, 8, 'pre_trip', '2026-03-18', '06:30:00', 112400, 'conditional', 'ok', 'ok', 'ok', 'ok', 'minor', 'ok', 'ok', 'minor', 'ok', 'ok', 'Intermittent black exhaust smoke under load', 'Turbo inspection scheduled for 2026-03-25', 'Antonio Vasquez', 'completed'),
(7, 15, 'pre_trip', '2026-03-18', '07:00:00', 32100, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Lakshmi Ramasamy', 'completed'),
(8, 3, 'pre_trip', '2026-03-18', '06:00:00', 67800, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Priya Patel', 'completed'),
(9, 5, 'pre_trip', '2026-03-18', '06:15:00', 89400, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Fatima Al-Hassan', 'completed'),
(10, 7, 'pre_trip', '2026-03-18', '06:30:00', 28900, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Sarah Thompson', 'completed'),
(13, 9, 'pre_trip', '2026-03-18', '07:00:00', 34500, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Wei Chen', 'completed'),
(14, 10, 'pre_trip', '2026-03-18', '18:00:00', 52800, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Oluwaseun Adeyemi', 'completed'),
(15, 11, 'pre_trip', '2026-03-18', '07:15:00', 28900, 'conditional', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'Humming noise from front right wheel area at highway speeds', 'Wheel bearing inspection scheduled for 2026-03-28', 'Jennifer Martinez', 'completed'),
(16, 14, 'pre_trip', '2026-03-15', '08:00:00', 61200, 'fail', 'ok', 'defect', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'All four tires below minimum tread depth', 'Vehicle pulled from service. Tire replacement on hold pending parts.', 'Dmitri Volkov', 'completed'),
(19, NULL, 'pre_trip', '2026-03-18', '07:30:00', 18500, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Fleet Admin', 'completed'),
(20, 13, 'pre_trip', '2026-03-18', '06:00:00', 76200, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'Amara Okafor', 'completed'),
(2, 2, 'post_trip', '2026-03-17', '19:30:00', 124100, 'pass', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', NULL, NULL, 'James Washington', 'completed')
ON CONFLICT DO NOTHING;

-- Warranties (16 records)
INSERT INTO warranties (vehicle_id, warranty_type, provider, policy_number, start_date, end_date, mileage_limit, coverage_description, deductible, contact_phone, contact_email, status, claims_filed, notes) VALUES
(1, 'Powertrain', 'Freightliner Warranty', 'FW-PT-2023-10001', '2023-01-15', '2028-01-15', 500000, 'Engine, transmission, drive axle, and turbocharger coverage', 250.00, '(800) 385-4357', 'warranty@freightliner.com', 'active', 0, NULL),
(1, 'Extended', 'FleetCare Plus', 'FCP-EXT-2023-5501', '2023-01-15', '2027-01-15', 400000, 'Comprehensive bumper-to-bumper extended coverage', 500.00, '(888) 555-3287', 'claims@fleetcareplus.com', 'active', 1, 'One claim filed for AC repair'),
(2, 'Powertrain', 'Peterbilt Warranty', 'PB-PT-2022-20002', '2022-06-01', '2027-06-01', 500000, 'Engine and drivetrain coverage', 250.00, '(800) 473-8372', 'warranty@peterbilt.com', 'active', 0, NULL),
(3, 'Bumper-to-Bumper', 'Kenworth Warranty', 'KW-BTB-2024-30003', '2024-03-01', '2027-03-01', 150000, 'Full vehicle coverage excluding wear items', 100.00, '(800) 538-9678', 'warranty@kenworth.com', 'active', 0, 'New vehicle warranty'),
(4, 'Powertrain', 'Volvo Warranty', 'VV-PT-2023-40004', '2023-04-10', '2028-04-10', 500000, 'Engine, transmission, and aftertreatment system', 250.00, '(800) 528-6586', 'warranty@volvotrucks.com', 'active', 1, 'Water pump claim pending'),
(5, 'Extended', 'FleetCare Plus', 'FCP-EXT-2021-5505', '2021-09-01', '2026-09-01', 350000, 'Extended powertrain and electrical coverage', 500.00, '(888) 555-3287', 'claims@fleetcareplus.com', 'expiring_soon', 2, 'Warranty expiring in 6 months'),
(7, 'Bumper-to-Bumper', 'Kenworth Warranty', 'KW-BTB-2024-30007', '2024-06-15', '2027-06-15', 150000, 'Full vehicle coverage excluding wear items', 100.00, '(800) 538-9678', 'warranty@kenworth.com', 'active', 0, NULL),
(8, 'Chassis', 'Blue Bird Warranty', 'BB-CH-2023-80008', '2023-02-20', '2026-02-20', 100000, 'Chassis frame and body structure', 200.00, '(478) 822-2242', 'warranty@blue-bird.com', 'expired', 1, 'Warranty expired'),
(12, 'Battery', 'Thomas Built Warranty', 'TB-BAT-2025-1212', '2025-01-10', '2033-01-10', 500000, 'High-voltage battery pack and electric drivetrain', 0.00, '(800) 868-6627', 'evwarranty@thomasbuilt.com', 'active', 0, '8-year battery warranty'),
(13, 'Hybrid System', 'Toyota Warranty', 'TY-HYB-2024-1313', '2024-01-05', '2034-01-05', 150000, 'Hybrid battery, electric motor, and power control unit', 0.00, '(800) 331-4331', 'warranty@toyota.com', 'active', 0, '10-year hybrid warranty'),
(14, 'Powertrain', 'Honda Warranty', 'HN-PT-2023-1414', '2023-03-20', '2028-03-20', 60000, 'Engine, transmission, and drivetrain', 0.00, '(800) 999-1009', 'warranty@honda.com', 'active', 0, NULL),
(19, 'Bumper-to-Bumper', 'Volvo Warranty', 'VV-BTB-2025-1919', '2025-01-20', '2028-01-20', 150000, 'Full vehicle coverage', 100.00, '(800) 528-6586', 'warranty@volvotrucks.com', 'active', 0, 'New truck full coverage'),
(19, 'Powertrain', 'Volvo Warranty', 'VV-PT-2025-1919', '2025-01-20', '2030-01-20', 500000, 'Engine, transmission, aftertreatment', 250.00, '(800) 528-6586', 'warranty@volvotrucks.com', 'active', 0, NULL),
(1, 'Tire', 'TireGuard Pro', 'TGP-TIRE-2025-1001', '2025-06-15', '2027-06-15', 100000, 'Road hazard and defect coverage for steer tires', 75.00, '(800) 555-8473', 'claims@tireguardpro.com', 'active', 0, 'Covers 2 steer tires'),
(9, 'Chassis', 'Thomas Built Warranty', 'TB-CH-2022-90009', '2022-08-15', '2025-08-15', 100000, 'Chassis and body structure coverage', 200.00, '(800) 868-6627', 'warranty@thomasbuilt.com', 'expired', 0, 'Warranty expired Aug 2025'),
(6, 'Tire', 'TireGuard Pro', 'TGP-TIRE-2025-1006', '2025-08-01', '2027-08-01', 80000, 'Road hazard protection for all positions', 75.00, '(800) 555-8473', 'claims@tireguardpro.com', 'active', 0, NULL)
ON CONFLICT DO NOTHING;

-- Vendors (16 records)
INSERT INTO vendors (name, type, contact_person, email, phone, address, city, state, zip, services_offered, rating, payment_terms, contract_start, contract_end, status, notes) VALUES
('Lone Star Truck Repair', 'repair_shop', 'Miguel Fernandez', 'miguel@lonestartruckrepair.com', '(214) 555-0101', '4520 Industrial Blvd', 'Dallas', 'TX', '75207', 'Full service truck repair, engine overhaul, transmission service, welding', 4.85, 'Net 30', '2025-01-01', '2026-12-31', 'active', 'Primary heavy truck repair partner'),
('Metro Fleet Services', 'repair_shop', 'Karen Williams', 'karen@metrofleetservices.com', '(214) 555-0202', '8901 Commerce St', 'Dallas', 'TX', '75226', 'Fleet maintenance, DOT inspections, preventive maintenance programs', 4.70, 'Net 30', '2025-03-01', '2027-02-28', 'active', 'DOT inspection certified'),
('TireHub Dallas', 'tire_center', 'Brian Cooper', 'brian@tirehubdallas.com', '(972) 555-0303', '2200 N Stemmons Fwy', 'Dallas', 'TX', '75207', 'Commercial tire sales, mounting, balancing, alignment, 24/7 roadside', 4.90, 'Net 15', '2025-01-15', '2026-12-31', 'active', '24/7 emergency roadside tire service'),
('AllParts Express', 'parts_supplier', 'David Chen', 'david@allpartsexpress.com', '(817) 555-0404', '1500 W Vickery Blvd', 'Fort Worth', 'TX', '76104', 'Heavy duty truck parts, next-day delivery, OEM and aftermarket', 4.60, 'Net 45', '2025-06-01', '2027-05-31', 'active', 'Bulk discount available on brake components'),
('FleetPride Distribution', 'parts_supplier', 'Amanda Torres', 'amanda@fleetpride.com', '(800) 555-0505', '600 E Las Colinas Blvd', 'Irving', 'TX', '75039', 'Nationwide heavy-duty parts distributor, filters, brakes, electrical', 4.75, 'Net 30', '2024-07-01', '2026-06-30', 'active', 'National account pricing'),
('DFW Freightliner Dealership', 'dealership', 'Robert Jackson', 'rjackson@dfwfreightliner.com', '(214) 555-0606', '9500 N Central Expy', 'Dallas', 'TX', '75231', 'Freightliner sales, warranty service, genuine parts, body shop', 4.50, 'Net 30', '2025-01-01', '2026-12-31', 'active', 'Authorized warranty service center'),
('Bus Maintenance Center', 'repair_shop', 'Patricia Gomez', 'pgomez@busmaintcenter.com', '(469) 555-0707', '3300 E Loop 820', 'Fort Worth', 'TX', '76119', 'School bus and transit bus repair, state inspections, body repair', 4.80, 'Net 30', '2025-02-01', '2027-01-31', 'active', 'Certified school bus inspector'),
('Interstate Batteries DFW', 'parts_supplier', 'Tom Richards', 'tom@interstatebatteries.com', '(972) 555-0808', '12770 Merit Dr', 'Dallas', 'TX', '75251', 'Commercial batteries, testing, fleet battery programs, recycling', 4.65, 'Net 15', '2025-04-01', '2026-03-31', 'active', 'Free on-site battery testing'),
('EV Service Center', 'repair_shop', 'Lisa Chang', 'lisa@evservicecenter.com', '(214) 555-0909', '7700 Greenville Ave', 'Dallas', 'TX', '75231', 'Electric vehicle service, battery diagnostics, HV system repair', 4.95, 'Net 30', '2025-08-01', '2027-07-31', 'active', 'Only EV-certified shop in area'),
('Toyota Dealer Service - Park Cities', 'dealership', 'Steve Morton', 'smorton@parkcitytoyota.com', '(214) 555-1010', '4001 W Plano Pkwy', 'Plano', 'TX', '75093', 'Toyota sales, service, genuine parts, hybrid specialist', 4.40, 'Due on receipt', NULL, NULL, 'active', 'Hybrid system certified'),
('Honda Dealer Service - Irving', 'dealership', 'Nancy Wright', 'nwright@irvinghonda.com', '(972) 555-1111', '1900 E Airport Fwy', 'Irving', 'TX', '75062', 'Honda sales, service, collision center', 4.35, 'Due on receipt', NULL, NULL, 'active', NULL),
('AutoBody Works Dallas', 'body_shop', 'Frank Morales', 'frank@autobodyworksdallas.com', '(214) 555-1212', '5100 Harry Hines Blvd', 'Dallas', 'TX', '75235', 'Collision repair, paint, frame straightening, glass replacement', 4.55, 'Net 30', '2025-05-01', '2026-04-30', 'active', 'Insurance approved shop'),
('24/7 Mobile Truck Repair', 'mobile_service', 'Jose Ramirez', 'jose@247mobiletruckrepair.com', '(469) 555-1313', NULL, 'Dallas', 'TX', NULL, 'Roadside repair, tire change, jump start, lockout, towing', 4.70, 'Due on completion', NULL, NULL, 'active', 'Emergency roadside - average response 45 min'),
('Southwest Diesel Specialists', 'repair_shop', 'Wayne Tucker', 'wayne@swdiesel.com', '(817) 555-1414', '6200 Camp Bowie Blvd', 'Fort Worth', 'TX', '76116', 'Diesel engine rebuild, fuel system repair, turbo service, DPF cleaning', 4.85, 'Net 30', '2025-09-01', '2027-08-31', 'active', 'Cummins and Detroit Diesel certified'),
('NAPA Fleet Solutions', 'parts_supplier', 'Chris Anderson', 'canderson@napafleet.com', '(800) 555-1515', '2800 Market Center Blvd', 'Dallas', 'TX', '75207', 'Fleet parts programs, filters, lubricants, tools, shop supplies', 4.50, 'Net 30', '2024-01-01', '2025-12-31', 'expiring_soon', 'Contract renewal pending'),
('Rapid Glass DFW', 'glass_shop', 'Megan Scott', 'megan@rapidglassdfw.com', '(214) 555-1616', '1800 N Fitzhugh Ave', 'Dallas', 'TX', '75204', 'Windshield replacement, side glass, back glass, mobile service', 4.60, 'Due on completion', NULL, NULL, 'active', 'Same-day mobile windshield replacement')
ON CONFLICT DO NOTHING;

-- Incidents (16 records)
INSERT INTO incidents (vehicle_id, driver_id, incident_type, date, time, location, description, severity, injuries, injury_details, police_report_number, insurance_claim_number, estimated_damage, repair_status, fault, witnesses, photos_count, status) VALUES
(16, 14, 'backing_accident', '2026-03-01', '09:15:00', 'Walmart parking lot, 2305 N Central Expy, Dallas, TX', 'Vehicle backed into a parked car while maneuvering in parking lot. Minor damage to rear bumper of taxi and front fender of other vehicle.', 'minor', false, NULL, 'DPD-2026-04521', 'CLM-2026-08890', 1200.00, 'completed', 'fleet_driver', 'Store security camera footage available', 4, 'closed'),
(6, 8, 'tire_blowout', '2026-02-25', '10:30:00', 'I-35 Northbound, Mile Marker 42, near Ardmore, OK', 'Right front steer tire blowout at highway speed. Driver maintained control and safely pulled to shoulder. Tire replaced by roadside service.', 'moderate', false, NULL, NULL, NULL, 650.00, 'completed', 'road_hazard', NULL, 2, 'closed'),
(2, 2, 'fender_bender', '2026-02-10', '14:20:00', 'Love''s Travel Stop #247, Dallas, TX', 'Low-speed contact with fuel island bollard while positioning for fueling. Minor scrape on right side fairing.', 'minor', false, NULL, NULL, NULL, 350.00, 'completed', 'fleet_driver', NULL, 3, 'closed'),
(5, 6, 'weather_related', '2026-01-15', '22:45:00', 'I-10 Westbound, near Fort Stockton, TX', 'High crosswinds caused trailer sway. Driver pulled off road safely. No contact with other vehicles. Minor cargo shift.', 'moderate', false, NULL, NULL, NULL, 200.00, 'completed', 'weather', 'Dispatch records show wind advisory was active', 0, 'closed'),
(14, 10, 'rear_end_collision', '2026-03-05', '19:30:00', 'Intersection of Elm St and Pearl St, Dallas, TX', 'Taxi was rear-ended while stopped at red light by distracted driver. Moderate damage to rear bumper and trunk area.', 'moderate', false, NULL, 'DPD-2026-05102', 'CLM-2026-09234', 2800.00, 'in_progress', 'other_party', 'Two pedestrian witnesses on scene', 6, 'open'),
(9, 5, 'backing_accident', '2026-01-20', '07:15:00', 'School bus yard, 400 E Royal Ln, Irving, TX', 'Bus clipped corner of maintenance shed while backing into parking spot. Minor damage to rear bumper and shed doorframe.', 'minor', false, NULL, NULL, NULL, 800.00, 'completed', 'fleet_driver', 'Yard camera footage reviewed', 2, 'closed'),
(3, 4, 'cargo_damage', '2026-02-28', '03:30:00', 'Warehouse loading dock, 1200 Distribution Way, Arlington, TX', 'Forklift operator punctured one pallet of goods while unloading. Trailer bed scratched. Cargo claim filed by shipper.', 'minor', false, NULL, NULL, 'CLM-2026-09001', 500.00, 'completed', 'third_party', 'Warehouse receiving manager', 3, 'closed'),
(8, 3, 'animal_strike', '2026-03-10', '06:45:00', 'FM 544, near Wylie, TX', 'Bus struck a deer crossing the road during morning route (no students on board). Damage to front bumper and grille.', 'moderate', false, NULL, NULL, 'CLM-2026-09455', 1500.00, 'in_progress', 'unavoidable', NULL, 4, 'open'),
(1, 1, 'near_miss', '2026-03-15', '11:00:00', 'I-45 Southbound, near Corsicana, TX', 'Four-wheeler cut in front of truck and brake-checked. Driver took evasive action. No contact made. Dashcam captured incident.', 'minor', false, NULL, NULL, NULL, 0.00, 'not_needed', 'other_party', 'Dashcam footage preserved', 0, 'closed'),
(15, 11, 'minor_collision', '2026-02-14', '12:30:00', 'Parking garage, 2100 Ross Ave, Dallas, TX', 'Side mirror clipped by concrete pillar in tight parking garage turn. Mirror housing cracked.', 'minor', false, NULL, NULL, NULL, 180.00, 'completed', 'fleet_driver', NULL, 2, 'closed'),
(7, 15, 'brake_incident', '2026-03-12', '16:00:00', 'US-75 exit ramp, Richardson, TX', 'Trailer brakes locked up momentarily on exit ramp. No collision. Flat spot on one tire. Brakes inspected and adjusted.', 'moderate', false, NULL, NULL, NULL, 450.00, 'completed', 'mechanical', NULL, 1, 'closed'),
(10, 7, 'vandalism', '2026-03-02', '06:00:00', 'Bus overnight parking area, 500 S Greenville Ave, Richardson, TX', 'Bus found with spray paint graffiti on passenger side during pre-trip inspection. Police report filed.', 'minor', false, NULL, 'RPD-2026-01122', NULL, 600.00, 'completed', 'third_party', NULL, 5, 'closed'),
(17, 17, 'fender_bender', '2026-03-08', '10:45:00', 'CVS parking lot, 3400 K Ave, Plano, TX', 'Taxi door opened into adjacent parked vehicle. Minor dent on other vehicle door.', 'minor', false, NULL, NULL, NULL, 250.00, 'completed', 'fleet_driver', 'Other driver present', 2, 'closed'),
(4, 16, 'mechanical_failure', '2026-03-07', '06:30:00', 'Fleet yard, 1000 Fleet Dr, Dallas, TX', 'Engine overheated during warm-up. Coolant sprayed from failed water pump. No fire or injuries. Vehicle towed to shop.', 'major', false, NULL, NULL, 'CLM-2026-09500', 2200.00, 'in_progress', 'mechanical', 'Morning shift driver witnessed', 3, 'open'),
(11, NULL, 'mechanical_failure', '2026-03-14', '05:50:00', 'Bus yard, 400 E Royal Ln, Irving, TX', 'Starter motor failed during pre-trip. Bus would not start. No movement incident. Maintenance notified.', 'minor', false, NULL, NULL, NULL, 1100.00, 'in_progress', 'mechanical', NULL, 0, 'open'),
(13, 9, 'passenger_incident', '2026-03-16', '14:20:00', '1500 Main St, Dallas, TX', 'Passenger tripped exiting taxi on uneven curb. Minor knee scrape. First aid offered and declined. Passenger continued on way.', 'minor', true, 'Minor knee abrasion - passenger declined medical attention', NULL, NULL, 0.00, 'not_needed', 'other', 'Dashcam interior footage', 0, 'open')
ON CONFLICT DO NOTHING;

-- Trip Logs (18 records)
INSERT INTO trip_logs (vehicle_id, driver_id, trip_number, origin, destination, departure_date, arrival_date, start_odometer, end_odometer, distance_miles, fuel_used, cargo_type, cargo_weight, revenue, tolls, status, notes) VALUES
(1, 1, 'TRIP-2026-001', 'Dallas, TX', 'Houston, TX', '2026-03-17 06:00:00', '2026-03-17 10:30:00', 87180, 87420, 240.00, 38.70, 'General Freight', 42000.00, 1850.00, 12.50, 'completed', 'I-45 corridor, normal traffic'),
(1, 1, 'TRIP-2026-002', 'Houston, TX', 'Dallas, TX', '2026-03-17 13:00:00', '2026-03-17 17:45:00', 87420, 87660, 240.00, 39.20, 'Electronics', 28000.00, 2100.00, 12.50, 'completed', 'Return trip, slight headwind'),
(2, 2, 'TRIP-2026-003', 'Dallas, TX', 'San Antonio, TX', '2026-03-18 05:30:00', '2026-03-18 10:00:00', 124050, 124320, 270.00, 46.55, 'Refrigerated Food', 38000.00, 2400.00, 8.75, 'completed', 'I-35 corridor, reefer unit running'),
(2, 2, 'TRIP-2026-004', 'San Antonio, TX', 'Dallas, TX', '2026-03-18 12:30:00', NULL, 124320, NULL, NULL, NULL, 'Building Materials', 44000.00, 1950.00, 8.75, 'in_progress', 'Return leg, heavy load'),
(3, 4, 'TRIP-2026-005', 'Arlington, TX', 'Fort Worth, TX', '2026-03-17 21:00:00', '2026-03-17 21:45:00', 45130, 45165, 35.00, 5.15, 'Retail Goods', 22000.00, 450.00, 0.00, 'completed', 'Night shift local delivery'),
(3, 4, 'TRIP-2026-006', 'Fort Worth, TX', 'Denton, TX', '2026-03-17 22:30:00', '2026-03-18 00:15:00', 45165, 45225, 60.00, 8.82, 'Retail Goods', 18000.00, 550.00, 3.50, 'completed', 'Night shift - light traffic'),
(5, 6, 'TRIP-2026-007', 'Dallas, TX', 'El Paso, TX', '2026-03-16 04:00:00', '2026-03-16 15:00:00', 156150, 156780, 630.00, 114.55, 'Automotive Parts', 35000.00, 4200.00, 15.00, 'completed', 'Long haul I-20/I-10, fueled in Fort Stockton'),
(5, 6, 'TRIP-2026-008', 'El Paso, TX', 'Dallas, TX', '2026-03-17 05:00:00', '2026-03-17 16:30:00', 156780, 157410, 630.00, 110.25, 'Empty', 0.00, 800.00, 15.00, 'completed', 'Deadhead return, good fuel economy empty'),
(6, 8, 'TRIP-2026-009', 'Dallas, TX', 'Oklahoma City, OK', '2026-03-18 06:00:00', NULL, 112200, NULL, NULL, NULL, 'Construction Materials', 43000.00, 1800.00, 6.25, 'in_progress', 'I-35 North, expected arrival 10:30 AM'),
(7, 15, 'TRIP-2026-010', 'Dallas, TX', 'Waco, TX', '2026-03-18 07:00:00', NULL, 31990, NULL, NULL, NULL, 'Paper Products', 30000.00, 900.00, 0.00, 'in_progress', 'I-35 South, regional delivery'),
(13, 9, 'TRIP-2026-011', 'Downtown Dallas', 'DFW Airport', '2026-03-18 08:15:00', '2026-03-18 08:55:00', 34480, 34500, 20.00, 0.48, 'Passenger', NULL, 45.00, 4.50, 'completed', 'Airport run - 1 passenger'),
(13, 9, 'TRIP-2026-012', 'DFW Airport', 'Uptown Dallas', '2026-03-18 09:20:00', '2026-03-18 09:55:00', 34500, 34522, 22.00, 0.52, 'Passenger', NULL, 38.00, 4.50, 'completed', 'Airport pickup'),
(14, 10, 'TRIP-2026-013', 'Irving, TX', 'DFW Airport', '2026-03-18 18:30:00', '2026-03-18 18:50:00', 52780, 52795, 15.00, 0.47, 'Passenger', NULL, 32.00, 0.00, 'completed', 'Evening airport shuttle'),
(15, 11, 'TRIP-2026-014', 'Highland Park, TX', 'Downtown Dallas', '2026-03-18 07:30:00', '2026-03-18 07:50:00', 28885, 28900, 15.00, 0.34, 'Passenger', NULL, 28.00, 0.00, 'completed', 'Morning commute run'),
(19, NULL, 'TRIP-2026-015', 'Dallas, TX', 'Austin, TX', '2026-03-18 08:00:00', NULL, 18400, NULL, NULL, NULL, 'Mixed Freight', 36000.00, 1600.00, 10.25, 'in_progress', 'I-35 South, new truck break-in period'),
(1, 1, 'TRIP-2026-016', 'Dallas, TX', 'Shreveport, LA', '2026-03-15 06:00:00', '2026-03-15 09:30:00', 86860, 87050, 190.00, 30.65, 'General Freight', 40000.00, 1500.00, 5.00, 'completed', 'I-20 East corridor'),
(6, 8, 'TRIP-2026-017', 'Oklahoma City, OK', 'Dallas, TX', '2026-03-17 13:00:00', '2026-03-17 17:00:00', 112000, 112200, 200.00, 32.79, 'Machinery', 40000.00, 1750.00, 6.25, 'completed', 'Return from OKC delivery'),
(20, 13, 'TRIP-2026-018', 'McKinney, TX', 'Plano, TX', '2026-03-18 06:30:00', '2026-03-18 07:15:00', 76180, 76200, 20.00, 2.50, 'Passengers (School)', NULL, 0.00, 0.00, 'completed', 'Morning school route - District 22 Route C')
ON CONFLICT DO NOTHING;
