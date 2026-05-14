const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  };
}

async function request(url, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: { ...authHeaders(), ...options.headers }
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || err.error || 'Request failed');
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (e) {
    throw e;
  }
}

// Auth
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(err.message || 'Login failed');
  }
  return await res.json();
}

export function getMe() { return request('/auth/me'); }

// Dashboard
export function getDashboardStats() { return request('/dashboard/stats'); }

// Vehicles
export function getVehicles(page = 1, limit = 20) { return request(`/vehicles?page=${page}&limit=${limit}`); }
export function getVehicle(id) { return request(`/vehicles/${id}`); }
export function createVehicle(data) { return request('/vehicles', { method: 'POST', body: JSON.stringify(data) }); }
export function updateVehicle(id, data) { return request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteVehicle(id) { return request(`/vehicles/${id}`, { method: 'DELETE' }); }

// Maintenance
export function getMaintenance() { return request('/maintenance'); }
export function getMaintenanceRecord(id) { return request(`/maintenance/${id}`); }
export function createMaintenance(data) { return request('/maintenance', { method: 'POST', body: JSON.stringify(data) }); }
export function updateMaintenance(id, data) { return request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteMaintenance(id) { return request(`/maintenance/${id}`, { method: 'DELETE' }); }

// Compliance
export function getCompliance() { return request('/compliance'); }
export function getComplianceRecord(id) { return request(`/compliance/${id}`); }
export function createCompliance(data) { return request('/compliance', { method: 'POST', body: JSON.stringify(data) }); }
export function updateCompliance(id, data) { return request(`/compliance/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteCompliance(id) { return request(`/compliance/${id}`, { method: 'DELETE' }); }

// Parts
export function getParts() { return request('/parts'); }
export function getPart(id) { return request(`/parts/${id}`); }
export function createPart(data) { return request('/parts', { method: 'POST', body: JSON.stringify(data) }); }
export function updatePart(id, data) { return request(`/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deletePart(id) { return request(`/parts/${id}`, { method: 'DELETE' }); }

// Work Orders
export function getWorkOrders() { return request('/workorders'); }
export function getWorkOrder(id) { return request(`/workorders/${id}`); }
export function createWorkOrder(data) { return request('/workorders', { method: 'POST', body: JSON.stringify(data) }); }
export function updateWorkOrder(id, data) { return request(`/workorders/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteWorkOrder(id) { return request(`/workorders/${id}`, { method: 'DELETE' }); }

// Drivers
export function getDrivers(page = 1, limit = 20) { return request(`/drivers?page=${page}&limit=${limit}`); }
export function getDriver(id) { return request(`/drivers/${id}`); }
export function createDriver(data) { return request('/drivers', { method: 'POST', body: JSON.stringify(data) }); }
export function updateDriver(id, data) { return request(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteDriver(id) { return request(`/drivers/${id}`, { method: 'DELETE' }); }

// Assignments
export function getAssignments() { return request('/assignments'); }
export function getAssignment(id) { return request(`/assignments/${id}`); }
export function createAssignment(data) { return request('/assignments', { method: 'POST', body: JSON.stringify(data) }); }
export function updateAssignment(id, data) { return request(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteAssignment(id) { return request(`/assignments/${id}`, { method: 'DELETE' }); }

// Fuel
export function getFuelRecords() { return request('/fuel'); }
export function getFuelRecord(id) { return request(`/fuel/${id}`); }
export function createFuelRecord(data) { return request('/fuel', { method: 'POST', body: JSON.stringify(data) }); }
export function updateFuelRecord(id, data) { return request(`/fuel/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteFuelRecord(id) { return request(`/fuel/${id}`, { method: 'DELETE' }); }

// Downtime
export function getDowntimeRecords() { return request('/downtime'); }
export function getDowntimeRecord(id) { return request(`/downtime/${id}`); }
export function createDowntime(data) { return request('/downtime', { method: 'POST', body: JSON.stringify(data) }); }
export function updateDowntime(id, data) { return request(`/downtime/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteDowntime(id) { return request(`/downtime/${id}`, { method: 'DELETE' }); }

// Scheduling
export function getSchedules() { return request('/scheduling'); }
export function getSchedule(id) { return request(`/scheduling/${id}`); }
export function createSchedule(data) { return request('/scheduling', { method: 'POST', body: JSON.stringify(data) }); }
export function updateSchedule(id, data) { return request(`/scheduling/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteSchedule(id) { return request(`/scheduling/${id}`, { method: 'DELETE' }); }

// Costs
export function getCosts() { return request('/costs'); }
export function getCost(id) { return request(`/costs/${id}`); }
export function createCost(data) { return request('/costs', { method: 'POST', body: JSON.stringify(data) }); }
export function updateCost(id, data) { return request(`/costs/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteCost(id) { return request(`/costs/${id}`, { method: 'DELETE' }); }

// Alerts
export function getAlerts() { return request('/alerts'); }
export function getAlert(id) { return request(`/alerts/${id}`); }
export function createAlert(data) { return request('/alerts', { method: 'POST', body: JSON.stringify(data) }); }
export function updateAlert(id, data) { return request(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteAlert(id) { return request(`/alerts/${id}`, { method: 'DELETE' }); }

// AI
export function predictMaintenance(vehicleId) { return request('/ai/predictive-maintenance', { method: 'POST', body: JSON.stringify({ vehicle_id: vehicleId }) }); }
export function getFleetAnalytics() { return request('/ai/fleet-analytics', { method: 'POST', body: JSON.stringify({}) }); }
export function optimizeRoute(data) { return request('/ai/route-optimization', { method: 'POST', body: JSON.stringify(data) }); }
export function checkCompliance(vehicleId) { return request('/ai/compliance-check', { method: 'POST', body: JSON.stringify({ vehicle_id: vehicleId }) }); }
export function analyzeCosts() { return request('/ai/cost-analysis', { method: 'POST', body: JSON.stringify({}) }); }
export function analyzeDriverPerformance(driverId) { return request('/ai/driver-performance', { method: 'POST', body: JSON.stringify({ driver_id: driverId }) }); }
export function scoreFleetReplacement(vehicleId) { return request('/ai/fleet-replacement-score', { method: 'POST', body: JSON.stringify({ vehicle_id: vehicleId }) }); }
export function getAIResults(page = 1) { return request(`/ai/results?page=${page}&limit=20`); }

// Tires
export function getTires() { return request('/tires'); }
export function getTire(id) { return request(`/tires/${id}`); }
export function createTire(data) { return request('/tires', { method: 'POST', body: JSON.stringify(data) }); }
export function updateTire(id, data) { return request(`/tires/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteTire(id) { return request(`/tires/${id}`, { method: 'DELETE' }); }

// Inspections
export function getInspections() { return request('/inspections'); }
export function getInspection(id) { return request(`/inspections/${id}`); }
export function createInspection(data) { return request('/inspections', { method: 'POST', body: JSON.stringify(data) }); }
export function updateInspection(id, data) { return request(`/inspections/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteInspection(id) { return request(`/inspections/${id}`, { method: 'DELETE' }); }

// Warranties
export function getWarranties() { return request('/warranties'); }
export function getWarranty(id) { return request(`/warranties/${id}`); }
export function createWarranty(data) { return request('/warranties', { method: 'POST', body: JSON.stringify(data) }); }
export function updateWarranty(id, data) { return request(`/warranties/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteWarranty(id) { return request(`/warranties/${id}`, { method: 'DELETE' }); }

// Vendors
export function getVendors() { return request('/vendors'); }
export function getVendor(id) { return request(`/vendors/${id}`); }
export function createVendor(data) { return request('/vendors', { method: 'POST', body: JSON.stringify(data) }); }
export function updateVendor(id, data) { return request(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteVendor(id) { return request(`/vendors/${id}`, { method: 'DELETE' }); }

// Incidents
export function getIncidents() { return request('/incidents'); }
export function getIncident(id) { return request(`/incidents/${id}`); }
export function createIncident(data) { return request('/incidents', { method: 'POST', body: JSON.stringify(data) }); }
export function updateIncident(id, data) { return request(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteIncident(id) { return request(`/incidents/${id}`, { method: 'DELETE' }); }

// Trip Logs
export function getTripLogs() { return request('/trips'); }
export function getTripLog(id) { return request(`/trips/${id}`); }
export function createTripLog(data) { return request('/trips', { method: 'POST', body: JSON.stringify(data) }); }
export function updateTripLog(id, data) { return request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function deleteTripLog(id) { return request(`/trips/${id}`, { method: 'DELETE' }); }

// Reports
export function getReportVehicles() { return request('/reports/vehicles'); }
export function getReportMaintenance(start, end) {
  const params = start && end ? `?start_date=${start}&end_date=${end}` : '';
  return request(`/reports/maintenance${params}`);
}
export function getReportCosts(start, end) {
  const params = start && end ? `?start_date=${start}&end_date=${end}` : '';
  return request(`/reports/costs${params}`);
}
export function getReportFuel() { return request('/reports/fuel'); }
export function getReportDrivers() { return request('/reports/drivers'); }

// Service Reminders
export function getReminders(days = 30) { return request(`/reminders?days=${days}`); }

// Fleet Overview
export function getFleetOverview() { return request('/fleet-overview'); }

// Profile
export function getProfile() { return request('/profile'); }
export function updateProfile(data) { return request('/profile', { method: 'PUT', body: JSON.stringify(data) }); }
export function changePassword(current_password, new_password) {
  return request('/profile/password', { method: 'PUT', body: JSON.stringify({ current_password, new_password }) });
}

// Activity Log
export function getActivityLog(limit = 50, type = '') {
  const params = new URLSearchParams({ limit });
  if (type) params.set('type', type);
  return request(`/activity-log?${params}`);
}
