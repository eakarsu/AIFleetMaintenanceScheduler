import { useState, useEffect } from 'react';
import { getReportVehicles, getReportMaintenance, getReportCosts, getReportFuel, getReportDrivers } from '../services/api';

function downloadCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] == null ? '' : String(row[h]);
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    )
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [costData, setCostData] = useState(null);
  const [fuelData, setFuelData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const loadReport = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'vehicles':
          setVehicleData(await getReportVehicles());
          break;
        case 'maintenance':
          setMaintenanceData(await getReportMaintenance(dateRange.start, dateRange.end));
          break;
        case 'costs':
          setCostData(await getReportCosts(dateRange.start, dateRange.end));
          break;
        case 'fuel':
          setFuelData(await getReportFuel());
          break;
        case 'drivers':
          setDriverData(await getReportDrivers());
          break;
      }
    } catch (err) {
      console.error('Report error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadReport(activeTab); }, [activeTab]);

  const tabs = [
    { key: 'vehicles', label: 'Vehicles', icon: '🚛' },
    { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { key: 'costs', label: 'Costs', icon: '💰' },
    { key: 'fuel', label: 'Fuel', icon: '⛽' },
    { key: 'drivers', label: 'Drivers', icon: '👤' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">📊</span> Reports & Export</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key}
            className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {(activeTab === 'maintenance' || activeTab === 'costs') && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: '160px' }}>
            <label>Start Date</label>
            <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
          </div>
          <div className="form-group" style={{ minWidth: '160px' }}>
            <label>End Date</label>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={() => loadReport(activeTab)}>Apply Filter</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="spinner"></div><p>Generating report...</p></div>
      ) : (
        <>
          {activeTab === 'vehicles' && vehicleData && (
            <div>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>{vehicleData.length} vehicles</span>
                <button className="btn btn-success btn-sm" onClick={() => downloadCSV(vehicleData, 'fleet_vehicles')}>Download CSV</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr>
                    <th>Vehicle ID</th><th>Type</th><th>Make/Model</th><th>Year</th><th>Mileage</th><th>Status</th><th>Driver</th><th>Next Service</th>
                  </tr></thead>
                  <tbody>
                    {vehicleData.map(v => (
                      <tr key={v.vehicle_id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.vehicle_id}</td>
                        <td>{v.type}</td>
                        <td>{v.make} {v.model}</td>
                        <td>{v.year}</td>
                        <td>{v.mileage?.toLocaleString()}</td>
                        <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                        <td>{v.assigned_driver || '—'}</td>
                        <td>{v.next_service_date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && maintenanceData && (
            <div>
              <div className="dashboard-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card blue">
                  <div className="stat-card-header"><span className="stat-card-icon">📋</span><span className="stat-card-label">Total</span></div>
                  <div className="stat-card-value">{maintenanceData.summary.total_records}</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-card-header"><span className="stat-card-icon">✅</span><span className="stat-card-label">Completed</span></div>
                  <div className="stat-card-value">{maintenanceData.summary.completed}</div>
                </div>
                <div className="stat-card yellow">
                  <div className="stat-card-header"><span className="stat-card-icon">🔄</span><span className="stat-card-label">In Progress</span></div>
                  <div className="stat-card-value">{maintenanceData.summary.in_progress}</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-card-header"><span className="stat-card-icon">💰</span><span className="stat-card-label">Total Cost</span></div>
                  <div className="stat-card-value">${Number(maintenanceData.summary.total_cost).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-success btn-sm" onClick={() => downloadCSV(maintenanceData.records, 'maintenance_report')}>Download CSV</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr>
                    <th>Vehicle</th><th>Type</th><th>Status</th><th>Priority</th><th>Scheduled</th><th>Cost</th><th>Technician</th>
                  </tr></thead>
                  <tbody>
                    {maintenanceData.records.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.vehicle_id}</td>
                        <td>{r.type}</td>
                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                        <td><span className={`badge badge-${r.priority}`}>{r.priority}</span></td>
                        <td>{r.scheduled_date || '—'}</td>
                        <td>${Number(r.cost).toLocaleString()}</td>
                        <td>{r.technician || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'costs' && costData && (
            <div>
              <h3 className="section-title">Cost by Category</h3>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-success btn-sm" onClick={() => downloadCSV(costData.by_category, 'costs_by_category')}>Download CSV</button>
              </div>
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead><tr><th>Category</th><th>Count</th><th>Total</th><th>Average</th><th>Min</th><th>Max</th></tr></thead>
                  <tbody>
                    {costData.by_category.map(c => (
                      <tr key={c.category}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.category}</td>
                        <td>{c.count}</td>
                        <td>${Number(c.total).toLocaleString()}</td>
                        <td>${Number(c.average).toFixed(2)}</td>
                        <td>${Number(c.min_cost).toLocaleString()}</td>
                        <td>${Number(c.max_cost).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="section-title">Cost by Vehicle</h3>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-success btn-sm" onClick={() => downloadCSV(costData.by_vehicle, 'costs_by_vehicle')}>Download CSV</button>
              </div>
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead><tr><th>Vehicle</th><th>Name</th><th>Records</th><th>Total Cost</th></tr></thead>
                  <tbody>
                    {costData.by_vehicle.map(v => (
                      <tr key={v.vehicle_id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.vehicle_id}</td>
                        <td>{v.vehicle_name}</td>
                        <td>{v.record_count}</td>
                        <td>${Number(v.total_cost).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="section-title">Monthly Trend</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Month</th><th>Records</th><th>Total</th></tr></thead>
                  <tbody>
                    {costData.monthly.map(m => (
                      <tr key={m.month}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.month}</td>
                        <td>{m.count}</td>
                        <td>${Number(m.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fuel' && fuelData && (
            <div>
              <h3 className="section-title">Fuel by Vehicle</h3>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-success btn-sm" onClick={() => downloadCSV(fuelData.by_vehicle, 'fuel_by_vehicle')}>Download CSV</button>
              </div>
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead><tr><th>Vehicle</th><th>Name</th><th>Fill-ups</th><th>Gallons</th><th>Cost</th><th>Avg MPG</th><th>Avg $/gal</th></tr></thead>
                  <tbody>
                    {fuelData.by_vehicle.map(v => (
                      <tr key={v.vehicle_id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.vehicle_id}</td>
                        <td>{v.vehicle_name}</td>
                        <td>{v.fill_ups}</td>
                        <td>{Number(v.total_gallons).toFixed(1)}</td>
                        <td>${Number(v.total_fuel_cost).toLocaleString()}</td>
                        <td>{v.avg_mpg ? Number(v.avg_mpg).toFixed(1) : '—'}</td>
                        <td>${v.avg_price_per_gallon ? Number(v.avg_price_per_gallon).toFixed(2) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="section-title">Monthly Fuel Trend</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Month</th><th>Fill-ups</th><th>Gallons</th><th>Cost</th><th>Avg MPG</th></tr></thead>
                  <tbody>
                    {fuelData.monthly.map(m => (
                      <tr key={m.month}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.month}</td>
                        <td>{m.fill_ups}</td>
                        <td>{Number(m.total_gallons).toFixed(1)}</td>
                        <td>${Number(m.total_cost).toLocaleString()}</td>
                        <td>{m.avg_mpg ? Number(m.avg_mpg).toFixed(1) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'drivers' && driverData && (
            <div>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>{driverData.length} drivers</span>
                <button className="btn btn-success btn-sm" onClick={() => downloadCSV(driverData, 'driver_performance')}>Download CSV</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr>
                    <th>Employee ID</th><th>Name</th><th>License</th><th>Status</th><th>Rating</th><th>Violations</th><th>Trips</th><th>Miles</th><th>Incidents</th>
                  </tr></thead>
                  <tbody>
                    {driverData.map(d => (
                      <tr key={d.employee_id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.employee_id}</td>
                        <td>{d.driver_name}</td>
                        <td>{d.license_type}</td>
                        <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                        <td style={{ color: Number(d.rating) >= 4 ? 'var(--accent-green)' : Number(d.rating) >= 3 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
                          {Number(d.rating).toFixed(1)}
                        </td>
                        <td>{d.violations}</td>
                        <td>{d.total_trips}</td>
                        <td>{Number(d.total_miles).toLocaleString()}</td>
                        <td style={{ color: d.total_incidents > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{d.total_incidents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
