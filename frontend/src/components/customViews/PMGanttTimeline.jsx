import { useState, useEffect } from 'react';

// VIZ: PM Schedule Gantt Timeline
export default function PMGanttTimeline() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/custom-views/pm-gantt', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load PM Gantt');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: 16, color: '#94a3b8' }}>Loading PM Gantt timeline...</div>;
  if (error) return <div style={{ padding: 16, color: '#ef4444' }}>{error}</div>;
  if (!data || !data.items || data.items.length === 0) {
    return <div style={{ padding: 16, color: '#94a3b8' }}>No scheduled maintenance items.</div>;
  }

  const spanStart = new Date(data.span.start);
  const spanEnd = new Date(data.span.end);
  const totalDays = Math.max(1, Math.ceil((spanEnd - spanStart) / (1000 * 60 * 60 * 24)));
  const dayWidth = Math.max(8, Math.min(24, 900 / totalDays));

  const priorityColor = (p) => p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#22c55e';

  // Date axis ticks every ~7 days
  const ticks = [];
  for (let d = 0; d <= totalDays; d += 7) {
    const tdate = new Date(spanStart);
    tdate.setDate(tdate.getDate() + d);
    ticks.push({ left: d * dayWidth, label: tdate.toISOString().slice(5, 10) });
  }

  return (
    <div data-testid="cv-pm-gantt" style={{ background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: '#f1f5f9', margin: 0 }}>PM Schedule Gantt Timeline</h3>
        <div style={{ color: '#94a3b8', fontSize: 12 }}>
          {data.span.start} → {data.span.end} ({data.total} items)
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 11, color: '#cbd5e1' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#ef4444', marginRight: 4 }} />High</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f59e0b', marginRight: 4 }} />Medium</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#22c55e', marginRight: 4 }} />Low</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ position: 'relative', width: totalDays * dayWidth + 260, minWidth: '100%' }}>
          {/* Axis */}
          <div style={{ display: 'flex', marginLeft: 260, marginBottom: 6, position: 'relative', height: 18, borderBottom: '1px solid #334155' }}>
            {ticks.map((t, i) => (
              <div key={i} style={{ position: 'absolute', left: t.left, fontSize: 10, color: '#94a3b8' }}>{t.label}</div>
            ))}
          </div>
          {/* Rows */}
          {data.items.slice(0, 50).map(item => {
            const s = new Date(item.start);
            const e = new Date(item.end);
            const offsetDays = Math.max(0, Math.round((s - spanStart) / (1000 * 60 * 60 * 24)));
            const durDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', height: 28, borderBottom: '1px solid #273345' }}>
                <div style={{ width: 260, color: '#e2e8f0', fontSize: 12, paddingRight: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <strong>{item.vehicle_label}</strong> — {item.service_type}
                </div>
                <div style={{ position: 'relative', flex: 1, height: 18 }}>
                  <div
                    title={`${item.service_type} (${item.priority}) ${item.start} → ${item.end}`}
                    style={{
                      position: 'absolute',
                      left: offsetDays * dayWidth,
                      width: durDays * dayWidth,
                      height: 18,
                      background: priorityColor(item.priority),
                      borderRadius: 3,
                      opacity: 0.85
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
