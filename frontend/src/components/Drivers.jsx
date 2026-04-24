import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  employee_id: '', first_name: '', last_name: '', email: '', phone: '',
  license_type: 'CDL-A', license_number: '', license_expiry: '',
  status: 'active', hire_date: '', rating: '', notes: ''
};

export default function Drivers() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getDrivers(); setItems(Array.isArray(d) ? d : d.drivers || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const handleCreate = async () => { try { await api.createDriver(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateDriver(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this driver?')) return; try { await api.deleteDriver(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading drivers...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Employee ID</label><input value={formData.employee_id || ''} onChange={e => onChange('employee_id', e.target.value)} placeholder="EMP-001" /></div>
      <div className="form-group"><label>First Name</label><input value={formData.first_name || ''} onChange={e => onChange('first_name', e.target.value)} /></div>
      <div className="form-group"><label>Last Name</label><input value={formData.last_name || ''} onChange={e => onChange('last_name', e.target.value)} /></div>
      <div className="form-group"><label>Email</label><input type="email" value={formData.email || ''} onChange={e => onChange('email', e.target.value)} /></div>
      <div className="form-group"><label>Phone</label><input value={formData.phone || ''} onChange={e => onChange('phone', e.target.value)} /></div>
      <div className="form-group"><label>License Type</label>
        <select value={formData.license_type || ''} onChange={e => onChange('license_type', e.target.value)}>
          <option value="CDL-A">CDL-A</option><option value="CDL-B">CDL-B</option><option value="CDL-C">CDL-C</option><option value="Class D">Class D</option>
        </select>
      </div>
      <div className="form-group"><label>License Number</label><input value={formData.license_number || ''} onChange={e => onChange('license_number', e.target.value)} /></div>
      <div className="form-group"><label>License Expiry</label><input type="date" value={formData.license_expiry?.split('T')[0] || ''} onChange={e => onChange('license_expiry', e.target.value)} /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="active">Active</option><option value="inactive">Inactive</option><option value="on_leave">On Leave</option><option value="suspended">Suspended</option>
        </select>
      </div>
      <div className="form-group"><label>Hire Date</label><input type="date" value={formData.hire_date?.split('T')[0] || ''} onChange={e => onChange('hire_date', e.target.value)} /></div>
      <div className="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" step="0.1" value={formData.rating || ''} onChange={e => onChange('rating', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">👤</span>Drivers</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Driver</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">👤</span><p>No drivers found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Employee ID</th><th>Name</th><th>License Type</th><th>License Expiry</th><th>Status</th><th>Rating</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.employee_id}</td><td>{item.first_name} {item.last_name}</td><td>{item.license_type}</td>
              <td>{item.license_expiry?.split('T')[0]}</td>
              <td><span className={getBadge(item.status)}>{item.status}</span></td>
              <td>{item.rating ? `${item.rating}/5` : '-'}</td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Driver' : 'Driver Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Employee ID</span><span className="detail-value">{selectedItem.employee_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Name</span><span className="detail-value">{selectedItem.first_name} {selectedItem.last_name}</span></div>
                  <div className="detail-field"><span className="detail-label">Email</span><span className="detail-value">{selectedItem.email || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Phone</span><span className="detail-value">{selectedItem.phone || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">License Type</span><span className="detail-value">{selectedItem.license_type}</span></div>
                  <div className="detail-field"><span className="detail-label">License #</span><span className="detail-value">{selectedItem.license_number || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">License Expiry</span><span className="detail-value">{selectedItem.license_expiry?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadge(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Hire Date</span><span className="detail-value">{selectedItem.hire_date?.split('T')[0] || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Rating</span><span className="detail-value">{selectedItem.rating ? `${selectedItem.rating}/5` : '-'}</span></div>
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
            <div className="modal-header"><h2>New Driver</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
