import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', service_type: '', frequency: 'monthly', last_completed: '',
  next_due: '', priority: 'medium', status: 'scheduled', assigned_to: '', notes: ''
};

export default function Scheduling() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getSchedules(); setItems(Array.isArray(d) ? d : d.schedules || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createSchedule(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateSchedule(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this schedule?')) return; try { await api.deleteSchedule(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading schedules...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Service Type</label>
        <select value={formData.service_type || ''} onChange={e => onChange('service_type', e.target.value)}>
          <option value="">Select</option><option value="oil_change">Oil Change</option><option value="tire_rotation">Tire Rotation</option><option value="brake_inspection">Brake Inspection</option><option value="engine_tune_up">Engine Tune-up</option><option value="transmission_service">Transmission Service</option><option value="full_inspection">Full Inspection</option>
        </select>
      </div>
      <div className="form-group"><label>Frequency</label>
        <select value={formData.frequency || ''} onChange={e => onChange('frequency', e.target.value)}>
          <option value="weekly">Weekly</option><option value="biweekly">Bi-weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="semi_annual">Semi-Annual</option><option value="annual">Annual</option><option value="mileage_based">Mileage Based</option>
        </select>
      </div>
      <div className="form-group"><label>Last Completed</label><input type="date" value={formData.last_completed?.split('T')[0] || ''} onChange={e => onChange('last_completed', e.target.value)} /></div>
      <div className="form-group"><label>Next Due</label><input type="date" value={formData.next_due?.split('T')[0] || ''} onChange={e => onChange('next_due', e.target.value)} /></div>
      <div className="form-group"><label>Priority</label>
        <select value={formData.priority || ''} onChange={e => onChange('priority', e.target.value)}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
      </div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="scheduled">Scheduled</option><option value="overdue">Overdue</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="form-group"><label>Assigned To</label><input value={formData.assigned_to || ''} onChange={e => onChange('assigned_to', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">📅</span>Scheduling</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Schedule</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">📅</span><p>No schedules found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Vehicle</th><th>Service Type</th><th>Frequency</th><th>Last Done</th><th>Next Due</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_id}</td><td>{item.service_type}</td><td>{item.frequency}</td>
              <td>{item.last_completed?.split('T')[0] || '-'}</td><td>{item.next_due?.split('T')[0]}</td>
              <td><span className={getBadge(item.priority)}>{item.priority}</span></td>
              <td><span className={getBadge(item.status)}>{item.status}</span></td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Schedule' : 'Schedule Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Service Type</span><span className="detail-value">{selectedItem.service_type}</span></div>
                  <div className="detail-field"><span className="detail-label">Frequency</span><span className="detail-value">{selectedItem.frequency}</span></div>
                  <div className="detail-field"><span className="detail-label">Last Completed</span><span className="detail-value">{selectedItem.last_completed?.split('T')[0] || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Next Due</span><span className="detail-value">{selectedItem.next_due?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Priority</span><span className="detail-value"><span className={getBadge(selectedItem.priority)}>{selectedItem.priority}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadge(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Assigned To</span><span className="detail-value">{selectedItem.assigned_to || '-'}</span></div>
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
            <div className="modal-header"><h2>New Schedule</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
