import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', inspection_type: '', inspection_date: '', expiry_date: '',
  status: 'valid', inspector: '', certificate_number: '', notes: ''
};

export default function Compliance() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getCompliance(); setItems(Array.isArray(d) ? d : d.records || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createCompliance(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateCompliance(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this compliance record?')) return; try { await api.deleteCompliance(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading compliance records...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Inspection Type</label>
        <select value={formData.inspection_type || ''} onChange={e => onChange('inspection_type', e.target.value)}>
          <option value="">Select</option><option value="dot_annual">DOT Annual</option><option value="emissions">Emissions</option><option value="safety">Safety</option><option value="brake">Brake</option><option value="fire_extinguisher">Fire Extinguisher</option>
        </select>
      </div>
      <div className="form-group"><label>Inspection Date</label><input type="date" value={formData.inspection_date?.split('T')[0] || ''} onChange={e => onChange('inspection_date', e.target.value)} /></div>
      <div className="form-group"><label>Expiry Date</label><input type="date" value={formData.expiry_date?.split('T')[0] || ''} onChange={e => onChange('expiry_date', e.target.value)} /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="valid">Valid</option><option value="expiring_soon">Expiring Soon</option><option value="expired">Expired</option><option value="failed">Failed</option>
        </select>
      </div>
      <div className="form-group"><label>Inspector</label><input value={formData.inspector || ''} onChange={e => onChange('inspector', e.target.value)} /></div>
      <div className="form-group"><label>Certificate #</label><input value={formData.certificate_number || ''} onChange={e => onChange('certificate_number', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">📋</span>Compliance</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Record</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">📋</span><p>No compliance records found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Vehicle</th><th>Inspection Type</th><th>Date</th><th>Expiry</th><th>Status</th><th>Inspector</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_id}</td><td>{item.inspection_type}</td><td>{item.inspection_date?.split('T')[0]}</td><td>{item.expiry_date?.split('T')[0]}</td>
              <td><span className={getBadge(item.status)}>{item.status}</span></td><td>{item.inspector}</td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Compliance' : 'Compliance Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Inspection Type</span><span className="detail-value">{selectedItem.inspection_type}</span></div>
                  <div className="detail-field"><span className="detail-label">Inspection Date</span><span className="detail-value">{selectedItem.inspection_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Expiry Date</span><span className="detail-value">{selectedItem.expiry_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadge(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Inspector</span><span className="detail-value">{selectedItem.inspector || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Certificate #</span><span className="detail-value">{selectedItem.certificate_number || '-'}</span></div>
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
            <div className="modal-header"><h2>New Compliance Record</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
