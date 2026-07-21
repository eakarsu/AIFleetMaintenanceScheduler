'use strict';

function evaluateMaintenancePlan(input = {}) {
  const errors = [];
  const vehicles = Array.isArray(input.vehicles) ? input.vehicles : [];
  const technicians = Array.isArray(input.technicians) ? input.technicians : [];
  const parts = new Map((input.parts || []).map((part) => [String(part.sku), Number(part.available || 0)]));
  const orders = Array.isArray(input.workOrders) ? input.workOrders : [];
  if (!vehicles.length) errors.push('vehicles is required');
  if (!technicians.length) errors.push('technicians is required');
  if (!orders.length) errors.push('workOrders is required');
  const vehicleIds = new Set(vehicles.map((vehicle) => String(vehicle.id)));
  const technicianHours = technicians.reduce((sum, technician) => sum + Math.max(0, Number(technician.availableHours || 0)), 0);
  let requiredHours = 0;
  const evaluatedOrders = orders.map((order) => {
    const issues = [];
    if (!order.id || !order.vehicleId) issues.push('id and vehicleId are required');
    if (!vehicleIds.has(String(order.vehicleId))) issues.push('unknown vehicle');
    const hours = Number(order.laborHours);
    if (!Number.isFinite(hours) || hours <= 0) issues.push('laborHours must be positive');
    requiredHours += Number.isFinite(hours) ? Math.max(0, hours) : 0;
    const unavailableParts = (order.requiredParts || []).filter((part) => (parts.get(String(part.sku)) || 0) < Number(part.quantity || 0));
    const vehicle = vehicles.find((item) => String(item.id) === String(order.vehicleId)) || {};
    const overdue = Number(vehicle.odometerKm || 0) >= Number(order.dueOdometerKm || Infinity) ||
      (order.dueAt && Date.parse(order.dueAt) <= Date.now());
    const repeatRepair = orders.some((candidate) => candidate.id !== order.id && candidate.vehicleId === order.vehicleId && candidate.system === order.system);
    return { id: order.id, issues, overdue, repeatRepair, unavailableParts, schedulable: !issues.length && !unavailableParts.length };
  });
  errors.push(...evaluatedOrders.flatMap((order) => order.issues.map((issue) => `work order ${order.id || '?'}: ${issue}`)));
  return {
    errors,
    result: {
      evaluatedOrders,
      requiredLaborHours: requiredHours,
      availableLaborHours: technicianHours,
      laborCapacityFeasible: technicianHours >= requiredHours,
      projectedDowntimeHours: evaluatedOrders.filter((order) => order.overdue).length * 8 + requiredHours,
      repeatRepairCount: evaluatedOrders.filter((order) => order.repeatRepair).length,
      decision: !errors.length && technicianHours >= requiredHours && evaluatedOrders.every((order) => order.schedulable) ? 'reviewable' : 'revise'
    },
    assumptions: ['parts counts are reservation-time snapshots', 'technician certifications require source-system verification'],
    uncertainty: { forecastIsRuleBased: true, requiresTechnicianApproval: true }
  };
}

module.exports = { evaluateMaintenancePlan };
