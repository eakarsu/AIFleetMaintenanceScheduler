import { useState, useEffect } from 'react';

// NON-VIZ: Maintenance Rules Editor (CRUD intervals/parts)
const EMPTY = {
  service_type: '',
  interval_miles: 5000,
  interval_days: 90,
  parts: '',
  priority: 'medium',
  est_cost: 100
};

export default function MaintenanceRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [status, setStatus] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/custom-views/maintenance-rules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRules(data.rules || []);
    } catch (e) {
      setStatus('Error loading rules: ' + e.message);
    }
    setLoading(false);
  };

  const onChange = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const submitNew = async () => {
    setStatus('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/custom-views/maintenance-rules', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Create failed');
      setForm({ ...EMPTY });
      setStatus('Rule created');
      load();
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  };

  const startEdit = (rule) => {
    setEditingId(rule.id);
    setForm({ ...rule });
  };

  const saveEdit = async () => {
    setStatus('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/custom-views/maintenance-rules/${editingId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Update failed');
      setEditingId(null);
      setForm({ ...EMPTY });
      setStatus('Rule updated');
      load();
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  };

  const cancelEdit = () => { setEditingId(null); setForm({ ...EMPTY }); };

  const remove = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/custom-views/maintenance-rules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setStatus('Rule deleted');
      load();
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  };

  const inputStyle = { background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155', padding: '6px 10px', borderRadius: 4, width: '100%' };
  const labelStyle = { display: 'block', color: '#cbd5e1', fontSize: 11, marginBottom: 3 };

  return (
    <div data-testid="cv-maintenance-rules" style={{ background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>Maintenance Rules Editor</h3>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Manage PM intervals and required parts. Used as the source for the PM checklist PDF.
      </p>

      {status && <div style={{ color: status.startsWith('Error') ? '#ef4444' : '#22c55e', fontSize: 12, marginBottom: 8 }}>{status}</div>}

      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 12, padding: 10, background: '#0f172a', borderRadius: 4 }}>
        <div><label style={labelStyle}>Service Type</label><input style={inputStyle} value={form.service_type} onChange={e => onChange('service_type', e.target.value)} /></div>
        <div><label style={labelStyle}>Interval Miles</label><input style={inputStyle} type="number" value={form.interval_miles} onChange={e => onChange('interval_miles', parseInt(e.target.value) || 0)} /></div>
        <div><label style={labelStyle}>Interval Days</label><input style={inputStyle} type="number" value={form.interval_days} onChange={e => onChange('interval_days', parseInt(e.target.value) || 0)} /></div>
        <div><label style={labelStyle}>Parts</label><input style={inputStyle} value={form.parts} onChange={e => onChange('parts', e.target.value)} /></div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select style={inputStyle} value={form.priority} onChange={e => onChange('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div><label style={labelStyle}>Est Cost ($)</label><input style={inputStyle} type="number" value={form.est_cost} onChange={e => onChange('est_cost', parseFloat(e.target.value) || 0)} /></div>
      </div>

      <div style={{ marginBottom: 14 }}>
        {editingId ? (
          <>
            <button onClick={saveEdit} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, marginRight: 8, cursor: 'pointer' }}>Save Changes</button>
            <button onClick={cancelEdit} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
          </>
        ) : (
          <button onClick={submitNew} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>+ Add Rule</button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading rules...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', color: '#e2e8f0', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Service Type</th>
                <th style={{ padding: 8, textAlign: 'right' }}>Miles</th>
                <th style={{ padding: 8, textAlign: 'right' }}>Days</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Parts</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Priority</th>
                <th style={{ padding: 8, textAlign: 'right' }}>Est Cost</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #273345' }}>
                  <td style={{ padding: 8 }}>{r.service_type}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{r.interval_miles}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{r.interval_days}</td>
                  <td style={{ padding: 8 }}>{r.parts}</td>
                  <td style={{ padding: 8 }}>{r.priority}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>${r.est_cost}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => startEdit(r)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, marginRight: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                    <button onClick={() => remove(r.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
