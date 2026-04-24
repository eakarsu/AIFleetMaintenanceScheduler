import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', type: '', description: '', status: 'scheduled', priority: 'medium',
  scheduled_date: '', completed_date: '', cost: '', technician: '', notes: ''
};

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getMaintenance();
      setItems(Array.isArray(data) ? data : data.records || data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchVehicles = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(Array.isArray(data) ? data : data.vehicles || data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    try { await api.createMaintenance(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); }
  };
  const handleUpdate = async () => {
    try { await api.updateMaintenance(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this maintenance record?')) return;
    try { await api.deleteMaintenance(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); }
  };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading maintenance records...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Type</label>
        <select value={formData.type || ''} onChange={e => onChange('type', e.target.value)}>
          <option value="">Select</option><option value="preventive">Preventive</option><option value="corrective">Corrective</option><option value="inspection">Inspection</option><option value="emergency">Emergency</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Description</label><textarea value={formData.description || ''} onChange={e => onChange('description', e.target.value)} placeholder="Describe the maintenance work" /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="scheduled">Scheduled</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="form-group"><label>Priority</label>
        <select value={formData.priority || ''} onChange={e => onChange('priority', e.target.value)}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
      </div>
      <div className="form-group"><label>Scheduled Date</label><input type="date" value={formData.scheduled_date?.split('T')[0] || ''} onChange={e => onChange('scheduled_date', e.target.value)} /></div>
      <div className="form-group"><label>Completed Date</label><input type="date" value={formData.completed_date?.split('T')[0] || ''} onChange={e => onChange('completed_date', e.target.value)} /></div>
      <div className="form-group"><label>Cost ($)</label><input type="number" step="0.01" value={formData.cost || ''} onChange={e => onChange('cost', e.target.value)} /></div>
      <div className="form-group"><label>Technician</label><input value={formData.technician || ''} onChange={e => onChange('technician', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🔧</span>Maintenance</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Record</button></div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state"><span className="empty-state-icon">🔧</span><p>No maintenance records found</p></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Vehicle</th><th>Type</th><th>Description</th><th>Status</th><th>Priority</th><th>Scheduled</th><th>Cost</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => openDetail(item)}>
                  <td>{item.vehicle_id}</td>
                  <td>{item.type}</td>
                  <td>{(item.description || '').substring(0, 40)}{(item.description || '').length > 40 ? '...' : ''}</td>
                  <td><span className={getBadge(item.status)}>{item.status}</span></td>
                  <td><span className={getBadge(item.priority)}>{item.priority}</span></td>
                  <td>{item.scheduled_date?.split('T')[0]}</td>
                  <td>{item.cost ? `$${Number(item.cost).toLocaleString()}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Maintenance' : 'Maintenance Details'}</h2>
              <button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button>
            </div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value">{selectedItem.type}</span></div>
                  <div className="detail-field full-width"><span className="detail-label">Description</span><span className="detail-value">{selectedItem.description}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadge(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Priority</span><span className="detail-value"><span className={getBadge(selectedItem.priority)}>{selectedItem.priority}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Scheduled</span><span className="detail-value">{selectedItem.scheduled_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Completed</span><span className="detail-value">{selectedItem.completed_date?.split('T')[0] || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Cost</span><span className="detail-value">{selectedItem.cost ? `$${Number(selectedItem.cost).toLocaleString()}` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Technician</span><span className="detail-value">{selectedItem.technician || '-'}</span></div>
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
            <div className="modal-header"><h2>New Maintenance Record</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
