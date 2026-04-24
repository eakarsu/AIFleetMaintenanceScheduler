import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  driver_id: '', vehicle_id: '', start_date: '', end_date: '',
  shift: 'day', route: '', status: 'active', notes: ''
};

export default function Assignments() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => { fetchItems(); fetchDrivers(); fetchVehicles(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getAssignments(); setItems(Array.isArray(d) ? d : d.assignments || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const fetchDrivers = async () => { try { const d = await api.getDrivers(); setDrivers(Array.isArray(d) ? d : d.drivers || d.data || []); } catch (e) {} };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createAssignment(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateAssignment(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this assignment?')) return; try { await api.deleteAssignment(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  const getDriverName = (id) => { const d = drivers.find(d => d.id == id); return d ? `${d.first_name} ${d.last_name}` : id; };
  const getVehicleLabel = (id) => { const v = vehicles.find(v => v.id == id); return v ? `${v.vehicle_id} - ${v.make} ${v.model}` : id; };

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading assignments...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Driver</label>
        <select value={formData.driver_id || ''} onChange={e => onChange('driver_id', e.target.value)}>
          <option value="">Select Driver</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.employee_id})</option>)}
        </select>
      </div>
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Start Date</label><input type="date" value={formData.start_date?.split('T')[0] || ''} onChange={e => onChange('start_date', e.target.value)} /></div>
      <div className="form-group"><label>End Date</label><input type="date" value={formData.end_date?.split('T')[0] || ''} onChange={e => onChange('end_date', e.target.value)} /></div>
      <div className="form-group"><label>Shift</label>
        <select value={formData.shift || ''} onChange={e => onChange('shift', e.target.value)}>
          <option value="day">Day</option><option value="night">Night</option><option value="split">Split</option>
        </select>
      </div>
      <div className="form-group"><label>Route</label><input value={formData.route || ''} onChange={e => onChange('route', e.target.value)} placeholder="Route name/number" /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🔗</span>Assignments</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Assignment</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">🔗</span><p>No assignments found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Driver</th><th>Vehicle</th><th>Start Date</th><th>End Date</th><th>Shift</th><th>Route</th><th>Status</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{getDriverName(item.driver_id)}</td><td>{getVehicleLabel(item.vehicle_id)}</td>
              <td>{item.start_date?.split('T')[0]}</td><td>{item.end_date?.split('T')[0] || '-'}</td>
              <td>{item.shift}</td><td>{item.route || '-'}</td>
              <td><span className={getBadge(item.status)}>{item.status}</span></td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Assignment' : 'Assignment Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Driver</span><span className="detail-value">{getDriverName(selectedItem.driver_id)}</span></div>
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{getVehicleLabel(selectedItem.vehicle_id)}</span></div>
                  <div className="detail-field"><span className="detail-label">Start Date</span><span className="detail-value">{selectedItem.start_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">End Date</span><span className="detail-value">{selectedItem.end_date?.split('T')[0] || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Shift</span><span className="detail-value">{selectedItem.shift}</span></div>
                  <div className="detail-field"><span className="detail-label">Route</span><span className="detail-value">{selectedItem.route || '-'}</span></div>
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
            <div className="modal-header"><h2>New Assignment</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
