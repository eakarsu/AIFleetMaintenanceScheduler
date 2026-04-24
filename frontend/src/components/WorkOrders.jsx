import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  order_number: '', vehicle_id: '', type: '', description: '', status: 'open',
  priority: 'medium', assigned_to: '', due_date: '', estimated_hours: '',
  actual_hours: '', cost: '', notes: ''
};

export default function WorkOrders() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getWorkOrders(); setItems(Array.isArray(d) ? d : d.workOrders || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createWorkOrder(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateWorkOrder(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this work order?')) return; try { await api.deleteWorkOrder(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading work orders...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Order Number</label><input value={formData.order_number || ''} onChange={e => onChange('order_number', e.target.value)} placeholder="WO-001" /></div>
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Type</label>
        <select value={formData.type || ''} onChange={e => onChange('type', e.target.value)}>
          <option value="">Select</option><option value="repair">Repair</option><option value="maintenance">Maintenance</option><option value="inspection">Inspection</option><option value="modification">Modification</option>
        </select>
      </div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="open">Open</option><option value="assigned">Assigned</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="form-group"><label>Priority</label>
        <select value={formData.priority || ''} onChange={e => onChange('priority', e.target.value)}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
      </div>
      <div className="form-group"><label>Assigned To</label><input value={formData.assigned_to || ''} onChange={e => onChange('assigned_to', e.target.value)} /></div>
      <div className="form-group"><label>Due Date</label><input type="date" value={formData.due_date?.split('T')[0] || ''} onChange={e => onChange('due_date', e.target.value)} /></div>
      <div className="form-group"><label>Est. Hours</label><input type="number" step="0.5" value={formData.estimated_hours || ''} onChange={e => onChange('estimated_hours', e.target.value)} /></div>
      <div className="form-group"><label>Actual Hours</label><input type="number" step="0.5" value={formData.actual_hours || ''} onChange={e => onChange('actual_hours', e.target.value)} /></div>
      <div className="form-group"><label>Cost ($)</label><input type="number" step="0.01" value={formData.cost || ''} onChange={e => onChange('cost', e.target.value)} /></div>
      <div className="form-group full-width"><label>Description</label><textarea value={formData.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">📝</span>Work Orders</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Work Order</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">📝</span><p>No work orders found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Order #</th><th>Vehicle</th><th>Type</th><th>Status</th><th>Priority</th><th>Assigned To</th><th>Due Date</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.order_number}</td><td>{item.vehicle_id}</td><td>{item.type}</td>
              <td><span className={getBadge(item.status)}>{item.status}</span></td>
              <td><span className={getBadge(item.priority)}>{item.priority}</span></td>
              <td>{item.assigned_to || '-'}</td><td>{item.due_date?.split('T')[0]}</td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Work Order' : 'Work Order Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Order #</span><span className="detail-value">{selectedItem.order_number}</span></div>
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value">{selectedItem.type}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadge(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Priority</span><span className="detail-value"><span className={getBadge(selectedItem.priority)}>{selectedItem.priority}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Assigned To</span><span className="detail-value">{selectedItem.assigned_to || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Due Date</span><span className="detail-value">{selectedItem.due_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Est. Hours</span><span className="detail-value">{selectedItem.estimated_hours || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Actual Hours</span><span className="detail-value">{selectedItem.actual_hours || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Cost</span><span className="detail-value">{selectedItem.cost ? `$${Number(selectedItem.cost).toLocaleString()}` : '-'}</span></div>
                  <div className="detail-field full-width"><span className="detail-label">Description</span><span className="detail-value">{selectedItem.description || '-'}</span></div>
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
            <div className="modal-header"><h2>New Work Order</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
