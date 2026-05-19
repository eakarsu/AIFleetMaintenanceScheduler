import { useState, useEffect } from 'react';

// VIZ: Downtime Heatmap (vehicle x week)
export default function DowntimeHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/custom-views/downtime-heatmap', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load Downtime heatmap');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: 16, color: '#94a3b8' }}>Loading downtime heatmap...</div>;
  if (error) return <div style={{ padding: 16, color: '#ef4444' }}>{error}</div>;
  if (!data || !data.grid) return <div style={{ padding: 16, color: '#94a3b8' }}>No data.</div>;

  const cellColor = (hours, maxHours) => {
    if (!hours || hours <= 0) return '#1e293b';
    const intensity = Math.min(1, hours / maxHours);
    // Gradient from green -> yellow -> red
    if (intensity < 0.34) return `rgba(34, 197, 94, ${0.35 + intensity})`;
    if (intensity < 0.67) return `rgba(245, 158, 11, ${0.45 + intensity * 0.5})`;
    return `rgba(239, 68, 68, ${0.55 + intensity * 0.4})`;
  };

  return (
    <div data-testid="cv-downtime-heatmap" style={{ background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: '#f1f5f9', margin: 0 }}>Downtime Heatmap (Vehicle x Week)</h3>
        <div style={{ color: '#94a3b8', fontSize: 12 }}>
          Max: {data.max_hours}h | Vehicles: {data.grid.length}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 2, color: '#e2e8f0', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: '#94a3b8', minWidth: 200 }}>Vehicle</th>
              {data.weeks.map(w => (
                <th key={w} style={{ padding: '4px 6px', color: '#94a3b8', fontWeight: 500, fontSize: 10 }}>
                  {w.slice(5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.grid.map(row => (
              <tr key={row.vehicle_id}>
                <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>{row.label}</td>
                {row.cells.map((c, i) => (
                  <td
                    key={i}
                    title={`${row.label}\nWeek ${c.week}\n${c.hours.toFixed(1)} hours`}
                    style={{
                      width: 38,
                      height: 28,
                      background: cellColor(c.hours, data.max_hours),
                      borderRadius: 3,
                      textAlign: 'center',
                      fontSize: 10,
                      color: c.hours > 0 ? '#0f172a' : '#475569',
                      fontWeight: 600
                    }}
                  >
                    {c.hours > 0 ? c.hours.toFixed(0) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: '#cbd5e1' }}>
        <span>Low</span>
        <div style={{ display: 'inline-block', width: 18, height: 12, background: 'rgba(34,197,94,0.6)' }} />
        <div style={{ display: 'inline-block', width: 18, height: 12, background: 'rgba(245,158,11,0.75)' }} />
        <div style={{ display: 'inline-block', width: 18, height: 12, background: 'rgba(239,68,68,0.85)' }} />
        <span>High downtime</span>
      </div>
    </div>
  );
}
