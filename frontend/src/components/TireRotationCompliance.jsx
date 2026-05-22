import { useEffect, useState } from 'react';
import * as api from '../services/api';

const emptyForm = { vehicle_id: '', odometer: 0, last_rotation_miles: 0, miles_overdue: 0, tire_set: '', priority: 'low', status: 'compliant' };

export default function TireRotationCompliance() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => setRows(await api.getTireRotationCompliance());
  useEffect(() => { load(); }, []);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    await api.createTireRotationCompliance(form);
    setForm(emptyForm);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🛞</span>Tire Rotation Compliance</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={save}>+ Add Review</button></div>
      </div>
      <div className="data-section" style={{ marginBottom: 16 }}>
        <div className="detail-grid">
          {['vehicle_id', 'tire_set'].map((key) => (
            <div className="form-group" key={key}><label>{key.replace(/_/g, ' ')}</label><input value={form[key]} onChange={(e) => setField(key, e.target.value)} /></div>
          ))}
          {['odometer', 'last_rotation_miles', 'miles_overdue'].map((key) => (
            <div className="form-group" key={key}><label>{key.replace(/_/g, ' ')}</label><input type="number" value={form[key]} onChange={(e) => setField(key, Number(e.target.value))} /></div>
          ))}
          <div className="form-group"><label>Priority</label><select value={form.priority} onChange={(e) => setField('priority', e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setField('status', e.target.value)}><option value="compliant">Compliant</option><option value="watch">Watch</option><option value="schedule_now">Schedule Now</option></select></div>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Odometer</th><th>Last Rotation</th><th>Overdue</th><th>Tire Set</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}><td>{row.vehicle_id}</td><td>{row.odometer}</td><td>{row.last_rotation_miles}</td><td>{row.miles_overdue}</td><td>{row.tire_set}</td><td>{row.priority}</td><td>{row.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
