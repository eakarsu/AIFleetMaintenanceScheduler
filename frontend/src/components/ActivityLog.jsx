import { useState, useEffect } from 'react';
import { getActivityLog } from '../services/api';

export default function ActivityLog() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [limit, setLimit] = useState(50);

  const load = async () => {
    setLoading(true);
    try {
      setData(await getActivityLog(limit, filterType));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterType, limit]);

  const typeConfig = {
    maintenance: { icon: '🔧', color: 'var(--accent-yellow)', label: 'Maintenance' },
    work_order: { icon: '📝', color: 'var(--accent-blue)', label: 'Work Order' },
    alert: { icon: '🔔', color: 'var(--accent-red)', label: 'Alert' },
    incident: { icon: '⚠️', color: 'var(--accent-orange)', label: 'Incident' },
    inspection: { icon: '✅', color: 'var(--accent-green)', label: 'Inspection' },
    fuel: { icon: '⛽', color: 'var(--accent-purple)', label: 'Fuel' }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading activity...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">📜</span> Activity Log</h1>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card blue">
            <div className="stat-card-header"><span className="stat-card-icon">📊</span><span className="stat-card-label">Total Activities</span></div>
            <div className="stat-card-value">{data.summary.total}</div>
          </div>
          {Object.entries(data.summary.by_type || {}).map(([type, count]) => {
            const tc = typeConfig[type] || { icon: '📌', color: 'var(--text-muted)', label: type };
            return (
              <div key={type} className="stat-card" onClick={() => setFilterType(filterType === type ? '' : type)}
                style={{ cursor: 'pointer', border: filterType === type ? '2px solid var(--accent-blue)' : undefined }}>
                <div className="stat-card-header"><span className="stat-card-icon">{tc.icon}</span><span className="stat-card-label">{tc.label}</span></div>
                <div className="stat-card-value" style={{ color: tc.color }}>{count}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ minWidth: '140px' }}>
          <label>Activity Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="maintenance">Maintenance</option>
            <option value="workorders">Work Orders</option>
            <option value="alerts">Alerts</option>
            <option value="incidents">Incidents</option>
            <option value="inspections">Inspections</option>
            <option value="fuel">Fuel</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: '100px' }}>
          <label>Show</label>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
      </div>

      {/* Activity Timeline */}
      {!data?.activities?.length ? (
        <div className="empty-state"><span className="empty-state-icon">📜</span><p>No activities found</p></div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '30px' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: '14px', top: '10px', bottom: '10px',
            width: '2px', background: 'var(--border-color)'
          }} />

          {data.activities.map((a, i) => {
            const tc = typeConfig[a.activity_type] || { icon: '📌', color: 'var(--text-muted)', label: a.activity_type };
            return (
              <div key={`${a.activity_type}-${a.id}-${i}`} style={{
                position: 'relative', marginBottom: '12px',
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)', padding: '14px 18px'
              }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', left: '-24px', top: '18px',
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: tc.color, border: '2px solid var(--bg-primary)'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>{tc.icon}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{a.title}</span>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {a.description?.length > 120 ? a.description.slice(0, 120) + '...' : a.description}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {a.vehicle_id} - {a.vehicle_name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    <div>{formatTimeAgo(a.created_at)}</div>
                    <div style={{ fontSize: '0.75rem' }}>{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
