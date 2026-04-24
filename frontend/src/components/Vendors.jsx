import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  name: '', type: '', contact_person: '', email: '', phone: '', address: '', city: '', state: '', zip: '',
  services_offered: '', rating: '5.00', payment_terms: '', contract_start: '', contract_end: '',
  status: 'active', notes: ''
};

export default function Vendors() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getVendors(); setItems(Array.isArray(d) ? d : d.data || []); } catch (e) {} setLoading(false); };

  const handleCreate = async () => { try { await api.createVendor(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateVendor(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this vendor?')) return; try { await api.deleteVendor(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadgeClass = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0;
    return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)) + ` (${r.toFixed(2)})`;
  };

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Name</label><input value={formData.name || ''} onChange={e => onChange('name', e.target.value)} placeholder="Vendor name" /></div>
      <div className="form-group"><label>Type</label>
        <select value={formData.type || ''} onChange={e => onChange('type', e.target.value)}>
          <option value="">Select</option><option value="mechanic">Mechanic Shop</option><option value="tire_shop">Tire Shop</option>
          <option value="parts_supplier">Parts Supplier</option><option value="dealership">Dealership</option>
          <option value="body_shop">Body Shop</option><option value="towing">Towing</option><option value="fuel_supplier">Fuel Supplier</option>
        </select>
      </div>
      <div className="form-group"><label>Contact Person</label><input value={formData.contact_person || ''} onChange={e => onChange('contact_person', e.target.value)} /></div>
      <div className="form-group"><label>Email</label><input type="email" value={formData.email || ''} onChange={e => onChange('email', e.target.value)} /></div>
      <div className="form-group"><label>Phone</label><input value={formData.phone || ''} onChange={e => onChange('phone', e.target.value)} /></div>
      <div className="form-group full-width"><label>Address</label><input value={formData.address || ''} onChange={e => onChange('address', e.target.value)} /></div>
      <div className="form-group"><label>City</label><input value={formData.city || ''} onChange={e => onChange('city', e.target.value)} /></div>
      <div className="form-group"><label>State</label><input value={formData.state || ''} onChange={e => onChange('state', e.target.value)} maxLength={2} placeholder="TX" /></div>
      <div className="form-group"><label>ZIP</label><input value={formData.zip || ''} onChange={e => onChange('zip', e.target.value)} /></div>
      <div className="form-group"><label>Rating</label><input type="number" step="0.01" min="0" max="5" value={formData.rating || ''} onChange={e => onChange('rating', e.target.value)} /></div>
      <div className="form-group"><label>Payment Terms</label><input value={formData.payment_terms || ''} onChange={e => onChange('payment_terms', e.target.value)} placeholder="e.g. Net 30" /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || 'active'} onChange={e => onChange('status', e.target.value)}>
          <option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option>
        </select>
      </div>
      <div className="form-group"><label>Contract Start</label><input type="date" value={formData.contract_start?.split('T')[0] || ''} onChange={e => onChange('contract_start', e.target.value)} /></div>
      <div className="form-group"><label>Contract End</label><input type="date" value={formData.contract_end?.split('T')[0] || ''} onChange={e => onChange('contract_end', e.target.value)} /></div>
      <div className="form-group full-width"><label>Services Offered</label><textarea value={formData.services_offered || ''} onChange={e => onChange('services_offered', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading vendors...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🏢</span>Vendor Management</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Vendor</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">🏢</span><p>No vendors found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr>
          <th>Name</th><th>Type</th><th>Contact</th><th>Phone</th><th>City/State</th><th>Rating</th><th>Status</th>
        </tr></thead><tbody>
          {items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.name}</td>
              <td>{(item.type || '').replace(/_/g, ' ')}</td>
              <td>{item.contact_person || '-'}</td>
              <td>{item.phone || '-'}</td>
              <td>{item.city}, {item.state}</td>
              <td style={{ color: 'var(--accent-yellow)' }}>{renderStars(item.rating)}</td>
              <td><span className={getBadgeClass(item.status)}>{item.status}</span></td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Vendor' : 'Vendor Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Name</span><span className="detail-value">{selectedItem.name}</span></div>
                  <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value">{(selectedItem.type || '').replace(/_/g, ' ')}</span></div>
                  <div className="detail-field"><span className="detail-label">Contact</span><span className="detail-value">{selectedItem.contact_person || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Email</span><span className="detail-value">{selectedItem.email || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Phone</span><span className="detail-value">{selectedItem.phone || '-'}</span></div>
                  <div className="detail-field full-width"><span className="detail-label">Address</span><span className="detail-value">{selectedItem.address || '-'}, {selectedItem.city} {selectedItem.state} {selectedItem.zip}</span></div>
                  <div className="detail-field"><span className="detail-label">Rating</span><span className="detail-value" style={{ color: 'var(--accent-yellow)' }}>{renderStars(selectedItem.rating)}</span></div>
                  <div className="detail-field"><span className="detail-label">Payment Terms</span><span className="detail-value">{selectedItem.payment_terms || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Contract Start</span><span className="detail-value">{selectedItem.contract_start?.split('T')[0] || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Contract End</span><span className="detail-value">{selectedItem.contract_end?.split('T')[0] || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadgeClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field full-width"><span className="detail-label">Services</span><span className="detail-value">{selectedItem.services_offered || '-'}</span></div>
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
            <div className="modal-header"><h2>New Vendor</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Vendor</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
