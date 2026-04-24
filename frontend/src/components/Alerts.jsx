import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', type: '', severity: 'medium', title: '', description: '',
  status: 'open', due_date: '', notes: ''
};

export default function Alerts() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getAlerts(); setItems(Array.isArray(d) ? d : d.alerts || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createAlert(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateAlert(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this alert?')) return; try { await api.deleteAlert(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const handleAcknowledge = async (item) => {
    try { await api.updateAlert(item.id, { ...item, status: 'acknowledged' }); fetchItems(); } catch (e) { console.error(e); }
  };
  const handleResolve = async (item) => {
    try { await api.updateAlert(item.id, { ...item, status: 'resolved' }); fetchItems(); } catch (e) { console.error(e); }
  };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading alerts...</span></div>;

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
          <option value="">Select</option><option value="maintenance_due">Maintenance Due</option><option value="compliance_expiry">Compliance Expiry</option><option value="part_low_stock">Part Low Stock</option><option value="license_expiry">License Expiry</option><option value="safety">Safety</option><option value="breakdown">Breakdown</option>
        </select>
      </div>
      <div className="form-group"><label>Severity</label>
        <select value={formData.severity || ''} onChange={e => onChange('severity', e.target.value)}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
      </div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Title</label><input value={formData.title || ''} onChange={e => onChange('title', e.target.value)} placeholder="Alert title" /></div>
      <div className="form-group full-width"><label>Description</label><textarea value={formData.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
      <div className="form-group"><label>Due Date</label><input type="date" value={formData.due_date?.split('T')[0] || ''} onChange={e => onChange('due_date', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🔔</span>Alerts</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Alert</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">🔔</span><p>No alerts found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Vehicle</th><th>Type</th><th>Severity</th><th>Title</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_id}</td><td>{item.type}</td>
              <td><span className={getBadge(item.severity)}>{item.severity}</span></td>
              <td>{item.title}</td>
              <td><span className={getBadge(item.status)}>{item.status}</span></td>
              <td>{item.due_date?.split('T')[0] || '-'}</td>
              <td onClick={e => e.stopPropagation()}>
                {item.status === 'open' && <button className="btn btn-outline btn-sm" onClick={() => handleAcknowledge(item)} style={{marginRight: 6}}>Ack</button>}
                {item.status !== 'resolved' && <button className="btn btn-success btn-sm" onClick={() => handleResolve(item)}>Resolve</button>}
              </td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Alert' : 'Alert Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value">{selectedItem.type}</span></div>
                  <div className="detail-field"><span className="detail-label">Severity</span><span className="detail-value"><span className={getBadge(selectedItem.severity)}>{selectedItem.severity}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadge(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field full-width"><span className="detail-label">Title</span><span className="detail-value">{selectedItem.title}</span></div>
                  <div className="detail-field full-width"><span className="detail-label">Description</span><span className="detail-value">{selectedItem.description || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Due Date</span><span className="detail-value">{selectedItem.due_date?.split('T')[0] || '-'}</span></div>
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
            <div className="modal-header"><h2>New Alert</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
