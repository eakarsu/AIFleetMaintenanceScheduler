import { useState, useEffect } from 'react';
import { getFleetOverview } from '../services/api';

export default function FleetOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        setData(await getFleetOverview());
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading fleet overview...</p></div>;
  if (!data) return <div className="empty-state"><span className="empty-state-icon">🚛</span><p>Failed to load fleet data</p></div>;

  const filtered = data.vehicles.filter(v => {
    if (filterType !== 'all' && v.type !== filterType) return false;
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    return true;
  });

  const statusColors = {
    active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: '🟢' },
    maintenance: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: '🟡' },
    inactive: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: '🔴' },
  };

  const typeIcons = { truck: '🚛', bus: '🚌', taxi: '🚕' };

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🗺️</span> Fleet Overview</h1>
      </div>

      {/* Status Summary */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card blue">
          <div className="stat-card-header"><span className="stat-card-icon">🚛</span><span className="stat-card-label">Total Fleet</span></div>
          <div className="stat-card-value">{data.total_vehicles}</div>
        </div>
        {data.status_summary.map(s => (
          <div key={s.status} className={`stat-card ${s.status === 'active' ? 'green' : s.status === 'maintenance' ? 'yellow' : 'red'}`}>
            <div className="stat-card-header"><span className="stat-card-icon">{statusColors[s.status]?.icon || '⚪'}</span><span className="stat-card-label">{s.status}</span></div>
            <div className="stat-card-value">{s.count}</div>
          </div>
        ))}
      </div>

      {/* Type Summary */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        {data.type_summary.map(t => (
          <div key={t.type} className="stat-card">
            <div className="stat-card-header"><span className="stat-card-icon">{typeIcons[t.type] || '🚗'}</span><span className="stat-card-label">{t.type}s</span></div>
            <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{t.count}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {t.active} active, {t.in_maintenance} in maintenance
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ minWidth: '120px' }}>
          <label>Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="truck">Trucks</option>
            <option value="bus">Buses</option>
            <option value="taxi">Taxis</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: '120px' }}>
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {filtered.map(v => {
          const sc = statusColors[v.status] || statusColors.active;
          return (
            <div key={v.id}
              onClick={() => setSelectedVehicle(selectedVehicle?.id === v.id ? null : v)}
              style={{
                background: 'var(--bg-card)', border: selectedVehicle?.id === v.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius)', padding: '18px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{typeIcons[v.type] || '🚗'}</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{v.vehicle_id}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{v.make} {v.model} ({v.year})</div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600,
                  background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30`
                }}>{v.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Mileage</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.mileage?.toLocaleString()} mi</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Avg MPG</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.avg_mpg ? Number(v.avg_mpg).toFixed(1) : '—'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Driver</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.assigned_driver || 'Unassigned'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Alerts</div>
                  <div style={{ color: v.active_alerts > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>
                    {v.active_alerts || 0}
                  </div>
                </div>
              </div>

              {(v.active_maintenance > 0 || v.open_work_orders > 0) && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  {v.active_maintenance > 0 && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-yellow)' }}>
                      {v.active_maintenance} maintenance
                    </span>
                  )}
                  {v.open_work_orders > 0 && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>
                      {v.open_work_orders} work orders
                    </span>
                  )}
                </div>
              )}

              {/* Expanded details */}
              {selectedVehicle?.id === v.id && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Last Service</div>
                      <div style={{ color: 'var(--text-primary)' }}>{v.last_service_date || '—'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Next Service</div>
                      <div style={{ color: 'var(--text-primary)' }}>{v.next_service_date || '—'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Fuel Cost (30d)</div>
                      <div style={{ color: 'var(--text-primary)' }}>{v.fuel_cost_30d ? `$${Number(v.fuel_cost_30d).toLocaleString()}` : '—'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Maint. Cost (30d)</div>
                      <div style={{ color: 'var(--text-primary)' }}>{v.maintenance_cost_30d ? `$${Number(v.maintenance_cost_30d).toLocaleString()}` : '—'}</div>
                    </div>
                    {v.driver_phone && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Driver Phone</div>
                        <div style={{ color: 'var(--text-primary)' }}>{v.driver_phone}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
