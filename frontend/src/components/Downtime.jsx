import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', reason: '', start_date: '', end_date: '', duration_hours: '',
  impact: 'low', cost_impact: '', status: 'active', notes: ''
};

export default function Downtime() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getDowntimeRecords(); setItems(Array.isArray(d) ? d : d.records || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createDowntime(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateDowntime(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this downtime record?')) return; try { await api.deleteDowntime(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading downtime records...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Reason</label>
        <select value={formData.reason || ''} onChange={e => onChange('reason', e.target.value)}>
          <option value="">Select</option><option value="maintenance">Maintenance</option><option value="repair">Repair</option><option value="accident">Accident</option><option value="inspection">Inspection</option><option value="weather">Weather</option><option value="driver_unavailable">Driver Unavailable</option><option value="parts_waiting">Waiting for Parts</option>
        </select>
      </div>
      <div className="form-group"><label>Start Date</label><input type="date" value={formData.start_date?.split('T')[0] || ''} onChange={e => onChange('start_date', e.target.value)} /></div>
      <div className="form-group"><label>End Date</label><input type="date" value={formData.end_date?.split('T')[0] || ''} onChange={e => onChange('end_date', e.target.value)} /></div>
      <div className="form-group"><label>Duration (Hours)</label><input type="number" step="0.5" value={formData.duration_hours || ''} onChange={e => onChange('duration_hours', e.target.value)} /></div>
      <div className="form-group"><label>Impact</label>
        <select value={formData.impact || ''} onChange={e => onChange('impact', e.target.value)}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
      </div>
      <div className="form-group"><label>Cost Impact ($)</label><input type="number" step="0.01" value={formData.cost_impact || ''} onChange={e => onChange('cost_impact', e.target.value)} /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="active">Active</option><option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">⏸️</span>Downtime</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Record</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">⏸️</span><p>No downtime records found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Vehicle</th><th>Reason</th><th>Start</th><th>End</th><th>Duration</th><th>Impact</th><th>Cost Impact</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_id}</td><td>{item.reason}</td><td>{item.start_date?.split('T')[0]}</td>
              <td>{item.end_date?.split('T')[0] || '-'}</td><td>{item.duration_hours ? `${item.duration_hours}h` : '-'}</td>
              <td><span className={getBadge(item.impact)}>{item.impact}</span></td>
              <td>{item.cost_impact ? `$${Number(item.cost_impact).toLocaleString()}` : '-'}</td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Downtime' : 'Downtime Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Reason</span><span className="detail-value">{selectedItem.reason}</span></div>
                  <div className="detail-field"><span className="detail-label">Start</span><span className="detail-value">{selectedItem.start_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">End</span><span className="detail-value">{selectedItem.end_date?.split('T')[0] || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Duration</span><span className="detail-value">{selectedItem.duration_hours ? `${selectedItem.duration_hours} hours` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Impact</span><span className="detail-value"><span className={getBadge(selectedItem.impact)}>{selectedItem.impact}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Cost Impact</span><span className="detail-value">{selectedItem.cost_impact ? `$${Number(selectedItem.cost_impact).toLocaleString()}` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadge(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field full-width"><span className="detail-label">Notes</span><span className="detail-value">{selectedItem.notes || '-'}</span></div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {isEditing ? (<><button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate}>Save</button></>) : (<><button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem.id)}>Delete</button><button className="btn btn-primary btn-sm" onClick={startEdit}>Edit</button></>)}
            </div>
          </div>
        </div>
      )}
      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Downtime Record</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
