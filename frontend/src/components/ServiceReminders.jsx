import { useState, useEffect } from 'react';
import { getReminders } from '../services/api';

export default function ServiceReminders() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [filterType, setFilterType] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      setData(await getReminders(days));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [days]);

  const filteredReminders = data?.reminders?.filter(r => {
    if (filterType !== 'all' && r.reminder_type !== filterType) return false;
    if (filterUrgency !== 'all' && r.urgency !== filterUrgency) return false;
    return true;
  }) || [];

  const urgencyColors = {
    overdue: { bg: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)', border: 'rgba(239,68,68,0.3)' },
    upcoming: { bg: 'rgba(245,158,11,0.15)', color: 'var(--accent-yellow)', border: 'rgba(245,158,11,0.3)' },
    future: { bg: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', border: 'rgba(59,130,246,0.3)' }
  };

  const typeIcons = { maintenance: '🔧', compliance: '📋', license: '🪪', warranty: '🛡️', parts: '⚙️' };

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading reminders...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🔔</span> Service Reminders</h1>
      </div>

      {data?.summary && (
        <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card red">
            <div className="stat-card-header"><span className="stat-card-icon">🚨</span><span className="stat-card-label">Overdue</span></div>
            <div className="stat-card-value">{data.summary.overdue}</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-card-header"><span className="stat-card-icon">⏰</span><span className="stat-card-label">Upcoming</span></div>
            <div className="stat-card-value">{data.summary.upcoming}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-card-header"><span className="stat-card-icon">📊</span><span className="stat-card-label">Total</span></div>
            <div className="stat-card-value">{data.summary.total}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-card-header"><span className="stat-card-icon">🔧</span><span className="stat-card-label">Maintenance</span></div>
            <div className="stat-card-value">{data.summary.by_type.maintenance}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ minWidth: '120px' }}>
          <label>Lookahead (days)</label>
          <select value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: '120px' }}>
          <label>Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="maintenance">Maintenance</option>
            <option value="compliance">Compliance</option>
            <option value="license">License</option>
            <option value="warranty">Warranty</option>
            <option value="parts">Parts</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: '120px' }}>
          <label>Urgency</label>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
            <option value="all">All</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
            <option value="future">Future</option>
          </select>
        </div>
      </div>

      {filteredReminders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">✅</span>
          <p>No reminders found for the selected filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredReminders.map((r, i) => {
            const uc = urgencyColors[r.urgency] || urgencyColors.future;
            return (
              <div key={`${r.reminder_type}-${r.id}-${i}`} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)', padding: '16px 20px',
                borderLeft: `4px solid ${uc.color}`, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{typeIcons[r.reminder_type] || '📌'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem',
                      fontWeight: 600, textTransform: 'uppercase',
                      background: uc.bg, color: uc.color, border: `1px solid ${uc.border}`
                    }}>{r.urgency}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>{r.vehicle_id} - {r.vehicle_name}</span>
                    {r.assigned_shop && <span>Shop: {r.assigned_shop}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div style={{ fontSize: '0.85rem', color: uc.color, fontWeight: 600 }}>
                    {r.due_date ? new Date(r.due_date).toLocaleDateString() : 'Now'}
                  </div>
                  {r.estimated_cost && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Est. ${Number(r.estimated_cost).toLocaleString()}
                    </div>
                  )}
                  <span className={`badge badge-${r.priority}`} style={{ marginTop: '4px' }}>{r.priority}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
