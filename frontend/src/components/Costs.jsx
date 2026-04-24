import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', category: '', description: '', amount: '', date: '',
  vendor: '', invoice_number: '', payment_status: 'pending', notes: ''
};

export default function Costs() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getCosts(); setItems(Array.isArray(d) ? d : d.costs || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createCost(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateCost(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this cost record?')) return; try { await api.deleteCost(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading costs...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Category</label>
        <select value={formData.category || ''} onChange={e => onChange('category', e.target.value)}>
          <option value="">Select</option><option value="maintenance">Maintenance</option><option value="fuel">Fuel</option><option value="insurance">Insurance</option><option value="registration">Registration</option><option value="tires">Tires</option><option value="repair">Repair</option><option value="parts">Parts</option><option value="labor">Labor</option><option value="other">Other</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Description</label><textarea value={formData.description || ''} onChange={e => onChange('description', e.target.value)} /></div>
      <div className="form-group"><label>Amount ($)</label><input type="number" step="0.01" value={formData.amount || ''} onChange={e => onChange('amount', e.target.value)} /></div>
      <div className="form-group"><label>Date</label><input type="date" value={formData.date?.split('T')[0] || ''} onChange={e => onChange('date', e.target.value)} /></div>
      <div className="form-group"><label>Vendor</label><input value={formData.vendor || ''} onChange={e => onChange('vendor', e.target.value)} /></div>
      <div className="form-group"><label>Invoice #</label><input value={formData.invoice_number || ''} onChange={e => onChange('invoice_number', e.target.value)} /></div>
      <div className="form-group"><label>Payment Status</label>
        <select value={formData.payment_status || ''} onChange={e => onChange('payment_status', e.target.value)}>
          <option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">💰</span>Costs</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Cost</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">💰</span><p>No cost records found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Vehicle</th><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Vendor</th><th>Payment</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_id}</td><td>{item.category}</td>
              <td>{(item.description || '').substring(0, 35)}{(item.description || '').length > 35 ? '...' : ''}</td>
              <td>{item.amount ? `$${Number(item.amount).toLocaleString()}` : '-'}</td>
              <td>{item.date?.split('T')[0]}</td><td>{item.vendor || '-'}</td>
              <td><span className={getBadge(item.payment_status)}>{item.payment_status}</span></td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Cost' : 'Cost Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Category</span><span className="detail-value">{selectedItem.category}</span></div>
                  <div className="detail-field full-width"><span className="detail-label">Description</span><span className="detail-value">{selectedItem.description || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Amount</span><span className="detail-value">{selectedItem.amount ? `$${Number(selectedItem.amount).toLocaleString()}` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Date</span><span className="detail-value">{selectedItem.date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Vendor</span><span className="detail-value">{selectedItem.vendor || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Invoice #</span><span className="detail-value">{selectedItem.invoice_number || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Payment Status</span><span className="detail-value"><span className={getBadge(selectedItem.payment_status)}>{selectedItem.payment_status}</span></span></div>
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
            <div className="modal-header"><h2>New Cost Record</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
