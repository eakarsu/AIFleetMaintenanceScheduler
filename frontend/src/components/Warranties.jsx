import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', warranty_type: '', provider: '', policy_number: '', start_date: '', end_date: '',
  mileage_limit: '', coverage_description: '', deductible: '', contact_phone: '', contact_email: '',
  status: 'active', claims_filed: '0', notes: ''
};

export default function Warranties() {
  const [items, setItems] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getWarranties(); setItems(Array.isArray(d) ? d : d.data || []); } catch (e) {} setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createWarranty(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateWarranty(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this warranty?')) return; try { await api.deleteWarranty(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadgeClass = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Warranty Type</label>
        <select value={formData.warranty_type || ''} onChange={e => onChange('warranty_type', e.target.value)}>
          <option value="">Select</option><option value="powertrain">Powertrain</option><option value="bumper_to_bumper">Bumper-to-Bumper</option>
          <option value="extended">Extended</option><option value="tire">Tire</option><option value="battery">Battery</option><option value="emission">Emission</option>
        </select>
      </div>
      <div className="form-group"><label>Provider</label><input value={formData.provider || ''} onChange={e => onChange('provider', e.target.value)} placeholder="Warranty provider" /></div>
      <div className="form-group"><label>Policy Number</label><input value={formData.policy_number || ''} onChange={e => onChange('policy_number', e.target.value)} /></div>
      <div className="form-group"><label>Start Date</label><input type="date" value={formData.start_date?.split('T')[0] || ''} onChange={e => onChange('start_date', e.target.value)} /></div>
      <div className="form-group"><label>End Date</label><input type="date" value={formData.end_date?.split('T')[0] || ''} onChange={e => onChange('end_date', e.target.value)} /></div>
      <div className="form-group"><label>Mileage Limit</label><input type="number" value={formData.mileage_limit || ''} onChange={e => onChange('mileage_limit', e.target.value)} /></div>
      <div className="form-group"><label>Deductible ($)</label><input type="number" step="0.01" value={formData.deductible || ''} onChange={e => onChange('deductible', e.target.value)} /></div>
      <div className="form-group"><label>Contact Phone</label><input value={formData.contact_phone || ''} onChange={e => onChange('contact_phone', e.target.value)} /></div>
      <div className="form-group"><label>Contact Email</label><input type="email" value={formData.contact_email || ''} onChange={e => onChange('contact_email', e.target.value)} /></div>
      <div className="form-group"><label>Claims Filed</label><input type="number" value={formData.claims_filed || '0'} onChange={e => onChange('claims_filed', e.target.value)} /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || 'active'} onChange={e => onChange('status', e.target.value)}>
          <option value="active">Active</option><option value="expiring_soon">Expiring Soon</option><option value="expired">Expired</option><option value="claimed">Claimed</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Coverage Description</label><textarea value={formData.coverage_description || ''} onChange={e => onChange('coverage_description', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading warranties...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🛡️</span>Warranty Tracking</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Warranty</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">🛡️</span><p>No warranties found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr>
          <th>Vehicle</th><th>Type</th><th>Provider</th><th>Policy #</th><th>Start</th><th>End</th><th>Status</th>
        </tr></thead><tbody>
          {items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_code || item.vehicle_id || '-'}</td>
              <td>{(item.warranty_type || '').replace(/_/g, ' ')}</td>
              <td>{item.provider}</td>
              <td>{item.policy_number || '-'}</td>
              <td>{item.start_date?.split('T')[0]}</td>
              <td>{item.end_date?.split('T')[0]}</td>
              <td><span className={getBadgeClass(item.status)}>{item.status}</span></td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Warranty' : 'Warranty Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_code || selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value">{(selectedItem.warranty_type || '').replace(/_/g, ' ')}</span></div>
                  <div className="detail-field"><span className="detail-label">Provider</span><span className="detail-value">{selectedItem.provider}</span></div>
                  <div className="detail-field"><span className="detail-label">Policy #</span><span className="detail-value">{selectedItem.policy_number || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Start Date</span><span className="detail-value">{selectedItem.start_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">End Date</span><span className="detail-value">{selectedItem.end_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Mileage Limit</span><span className="detail-value">{selectedItem.mileage_limit?.toLocaleString() || 'Unlimited'}</span></div>
                  <div className="detail-field"><span className="detail-label">Deductible</span><span className="detail-value">${Number(selectedItem.deductible || 0).toFixed(2)}</span></div>
                  <div className="detail-field"><span className="detail-label">Contact Phone</span><span className="detail-value">{selectedItem.contact_phone || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Contact Email</span><span className="detail-value">{selectedItem.contact_email || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Claims Filed</span><span className="detail-value">{selectedItem.claims_filed}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadgeClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field full-width"><span className="detail-label">Coverage</span><span className="detail-value">{selectedItem.coverage_description || '-'}</span></div>
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
            <div className="modal-header"><h2>New Warranty</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Warranty</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
