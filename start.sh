#!/bin/bash

# ============================================
# FleetGuard AI - Fleet Maintenance Scheduler
# Start Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║                                                  ║"
echo "║     🚛  FleetGuard AI                           ║"
echo "║     Fleet Maintenance Scheduler                  ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Step 1: Clean up used ports ----
echo -e "${YELLOW}[1/6] Cleaning up used ports...${NC}"

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${RED}  Killing processes on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo -e "${GREEN}  Port $port is free${NC}"
    fi
}

cleanup_port 3000
cleanup_port 3001

# ---- Step 2: Check prerequisites ----
echo -e "${YELLOW}[2/6] Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}  Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}  Node.js $(node -v) found${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}  PostgreSQL is not installed. Please install PostgreSQL${NC}"
    exit 1
fi
echo -e "${GREEN}  PostgreSQL found${NC}"

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
    echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    else
        sudo systemctl start postgresql 2>/dev/null || true
    fi
    sleep 2
    if ! pg_isready -q 2>/dev/null; then
        echo -e "${RED}  Could not start PostgreSQL. Please start it manually.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}  PostgreSQL is running${NC}"

# ---- Step 3: Setup Database ----
echo -e "${YELLOW}[3/6] Setting up database...${NC}"

# Load .env variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo -e "${GREEN}  .env loaded${NC}"
else
    echo -e "${RED}  .env file not found! Please create .env file${NC}"
    exit 1
fi

# Parse DATABASE_URL for connection details
DB_NAME="fleet_maintenance"
DB_USER="${PGUSER:-postgres}"

# Create database if it doesn't exist
if psql -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}  Database '$DB_NAME' already exists${NC}"
else
    echo -e "${CYAN}  Creating database '$DB_NAME'...${NC}"
    createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
    echo -e "${GREEN}  Database created${NC}"
fi

# Run init SQL
echo -e "${CYAN}  Initializing tables...${NC}"
psql -U "$DB_USER" -d "$DB_NAME" -f backend/db/init.sql -q 2>/dev/null || {
    echo -e "${YELLOW}  Warning: Some tables may already exist (this is OK)${NC}"
}
echo -e "${GREEN}  Tables initialized${NC}"

# Seed data (truncate and reseed)
echo -e "${CYAN}  Seeding data...${NC}"
psql -U "$DB_USER" -d "$DB_NAME" -c "
TRUNCATE trip_logs, incidents, vendors, warranties, inspections, tires,
alerts, cost_records, maintenance_schedule, downtime_records, fuel_records,
driver_assignments, work_orders, maintenance_records, compliance_records, parts_inventory,
drivers, vehicles, users RESTART IDENTITY CASCADE;
" -q 2>/dev/null || true

psql -U "$DB_USER" -d "$DB_NAME" -f backend/db/seed.sql -q 2>/dev/null || {
    echo -e "${RED}  Warning: Seed data may have issues${NC}"
}
echo -e "${GREEN}  Data seeded successfully${NC}"

# ---- Step 4: Install dependencies ----
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"

echo -e "${CYAN}  Installing backend dependencies...${NC}"
cd backend && npm install --silent 2>/dev/null && cd ..
echo -e "${GREEN}  Backend dependencies installed${NC}"

echo -e "${CYAN}  Installing frontend dependencies...${NC}"
cd frontend && npm install --silent 2>/dev/null && cd ..
echo -e "${GREEN}  Frontend dependencies installed${NC}"

# ---- Step 5: Start Backend with auto-reload ----
echo -e "${YELLOW}[5/6] Starting backend server (with hot reload)...${NC}"
cd backend && npx nodemon server.js &
BACKEND_PID=$!
cd ..
sleep 2
echo -e "${GREEN}  Backend running on http://localhost:3001 (PID: $BACKEND_PID)${NC}"

# ---- Step 6: Start Frontend with hot reload ----
echo -e "${YELLOW}[6/6] Starting frontend dev server (with hot reload)...${NC}"
cd frontend && npx vite --host &
FRONTEND_PID=$!
cd ..
sleep 3
echo -e "${GREEN}  Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)${NC}"

# ---- Ready! ----
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                  ║${NC}"
echo -e "${PURPLE}║  ${GREEN}✅ FleetGuard AI is ready!${PURPLE}                      ║${NC}"
echo -e "${PURPLE}║                                                  ║${NC}"
echo -e "${PURPLE}║  ${CYAN}Frontend:  ${NC}http://localhost:3000${PURPLE}               ║${NC}"
echo -e "${PURPLE}║  ${CYAN}Backend:   ${NC}http://localhost:3001${PURPLE}               ║${NC}"
echo -e "${PURPLE}║                                                  ║${NC}"
echo -e "${PURPLE}║  ${YELLOW}Login:${NC}     admin@fleetops.com / admin123${PURPLE}      ║${NC}"
echo -e "${PURPLE}║                                                  ║${NC}"
echo -e "${PURPLE}║  ${RED}Press Ctrl+C to stop all services${PURPLE}              ║${NC}"
echo -e "${PURPLE}║                                                  ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Handle shutdown
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down FleetGuard AI...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    cleanup_port 3000
    cleanup_port 3001
    echo -e "${GREEN}All services stopped. Goodbye!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait
