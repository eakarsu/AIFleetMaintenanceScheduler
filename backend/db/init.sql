-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_id VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  vin VARCHAR(17) UNIQUE NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  mileage INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  fuel_type VARCHAR(50) DEFAULT 'diesel',
  last_service_date DATE,
  next_service_date DATE,
  assigned_driver_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance Records
CREATE TABLE IF NOT EXISTS maintenance_records (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  priority VARCHAR(20) DEFAULT 'medium',
  scheduled_date DATE,
  completed_date DATE,
  cost DECIMAL(10,2) DEFAULT 0,
  technician VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- DOT Compliance
CREATE TABLE IF NOT EXISTS compliance_records (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  inspection_type VARCHAR(100) NOT NULL,
  inspection_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'valid',
  inspector_name VARCHAR(255),
  inspector_license VARCHAR(100),
  findings TEXT,
  corrective_actions TEXT,
  dot_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parts Inventory
CREATE TABLE IF NOT EXISTS parts_inventory (
  id SERIAL PRIMARY KEY,
  part_number VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 5,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  supplier VARCHAR(255),
  location VARCHAR(100),
  compatible_vehicles TEXT,
  last_ordered DATE,
  status VARCHAR(50) DEFAULT 'in_stock',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to VARCHAR(255),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  parts_used TEXT,
  cost DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  license_number VARCHAR(50) NOT NULL,
  license_type VARCHAR(20) NOT NULL,
  license_expiry DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  hire_date DATE,
  medical_card_expiry DATE,
  violations INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Driver Assignments
CREATE TABLE IF NOT EXISTS driver_assignments (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  shift VARCHAR(50) DEFAULT 'day',
  route VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fuel Records
CREATE TABLE IF NOT EXISTS fuel_records (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id),
  date DATE NOT NULL,
  gallons DECIMAL(10,2) NOT NULL,
  cost_per_gallon DECIMAL(5,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  odometer_reading INTEGER,
  fuel_type VARCHAR(50),
  station VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  mpg DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Downtime Records
CREATE TABLE IF NOT EXISTS downtime_records (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  duration_hours DECIMAL(10,2),
  impact VARCHAR(50) DEFAULT 'medium',
  cost_impact DECIMAL(10,2) DEFAULT 0,
  resolution TEXT,
  preventable BOOLEAN DEFAULT false,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance Schedule
CREATE TABLE IF NOT EXISTS maintenance_schedule (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type VARCHAR(255) NOT NULL,
  frequency_miles INTEGER,
  frequency_days INTEGER,
  last_performed DATE,
  next_due DATE NOT NULL,
  estimated_cost DECIMAL(10,2),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'upcoming',
  assigned_shop VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cost Records
CREATE TABLE IF NOT EXISTS cost_records (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  vendor VARCHAR(255),
  invoice_number VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'paid',
  recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  due_date DATE,
  resolved_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tire Management
CREATE TABLE IF NOT EXISTS tires (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  position VARCHAR(20) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  size VARCHAR(50) NOT NULL,
  dot_code VARCHAR(50),
  install_date DATE,
  mileage_at_install INTEGER DEFAULT 0,
  tread_depth DECIMAL(4,2),
  max_tread_depth DECIMAL(4,2) DEFAULT 11.0,
  pressure_psi DECIMAL(5,1),
  recommended_psi DECIMAL(5,1),
  condition VARCHAR(50) DEFAULT 'good',
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inspection Checklists (DVIR)
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id),
  inspection_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time TIME,
  odometer INTEGER,
  overall_status VARCHAR(50) DEFAULT 'pass',
  brakes VARCHAR(20) DEFAULT 'ok',
  tires_check VARCHAR(20) DEFAULT 'ok',
  lights VARCHAR(20) DEFAULT 'ok',
  fluids VARCHAR(20) DEFAULT 'ok',
  engine VARCHAR(20) DEFAULT 'ok',
  transmission VARCHAR(20) DEFAULT 'ok',
  steering VARCHAR(20) DEFAULT 'ok',
  exhaust VARCHAR(20) DEFAULT 'ok',
  body_exterior VARCHAR(20) DEFAULT 'ok',
  safety_equipment VARCHAR(20) DEFAULT 'ok',
  defects_found TEXT,
  corrective_action TEXT,
  inspector_signature VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Warranty Tracking
CREATE TABLE IF NOT EXISTS warranties (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  warranty_type VARCHAR(100) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  mileage_limit INTEGER,
  coverage_description TEXT,
  deductible DECIMAL(10,2) DEFAULT 0,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  claims_filed INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vendor Management
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  services_offered TEXT,
  rating DECIMAL(3,2) DEFAULT 5.00,
  payment_terms VARCHAR(100),
  contract_start DATE,
  contract_end DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incident Reports
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id),
  incident_type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME,
  location TEXT,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'minor',
  injuries BOOLEAN DEFAULT false,
  injury_details TEXT,
  police_report_number VARCHAR(100),
  insurance_claim_number VARCHAR(100),
  estimated_damage DECIMAL(10,2) DEFAULT 0,
  repair_status VARCHAR(50) DEFAULT 'pending',
  fault VARCHAR(50),
  witnesses TEXT,
  photos_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trip Logs
CREATE TABLE IF NOT EXISTS trip_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id),
  trip_number VARCHAR(50) UNIQUE NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  departure_date TIMESTAMP NOT NULL,
  arrival_date TIMESTAMP,
  start_odometer INTEGER,
  end_odometer INTEGER,
  distance_miles DECIMAL(10,2),
  fuel_used DECIMAL(10,2),
  cargo_type VARCHAR(100),
  cargo_weight DECIMAL(10,2),
  revenue DECIMAL(10,2) DEFAULT 0,
  tolls DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Predictions — stores all AI analysis results linked to vehicles/drivers
CREATE TABLE IF NOT EXISTS ai_predictions (
  id SERIAL PRIMARY KEY,
  prediction_type VARCHAR(100) NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  input_snapshot JSONB,
  analysis TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  vehicle_id INTEGER,
  driver_id INTEGER,
  endpoint VARCHAR(100),
  input_data JSONB,
  result TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
