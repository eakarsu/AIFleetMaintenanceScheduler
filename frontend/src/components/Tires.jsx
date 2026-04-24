import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', position: '', brand: '', model: '', size: '', dot_code: '',
  install_date: '', mileage_at_install: '', tread_depth: '', max_tread_depth: '11.0',
  pressure_psi: '', recommended_psi: '', condition: 'good', status: 'active', notes: ''
};

export default function Tires() {
  const [items, setItems] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchItems(); fetchVehicles(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try { const d = await api.getTires(); setItems(Array.isArray(d) ? d : d.data || []); } catch (e) { console.error(e); }
    setLoading(false);
  };
  const fetchVehicles = async () => {
    try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.data || []); } catch (e) {}
  };

  const handleCreate = async () => { try { await api.createTire(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateTire(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this tire record?')) return; try { await api.deleteTire(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadgeClass = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  const vehicleName = (id) => { const v = vehicles.find(x => x.id == id); return v ? `${v.vehicle_id} - ${v.make} ${v.model}` : id; };

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Position</label>
        <select value={formData.position || ''} onChange={e => onChange('position', e.target.value)}>
          <option value="">Select</option>
          <option value="LF">Left Front (LF)</option><option value="RF">Right Front (RF)</option>
          <option value="LR-O">Left Rear Outer (LR-O)</option><option value="LR-I">Left Rear Inner (LR-I)</option>
          <option value="RR-O">Right Rear Outer (RR-O)</option><option value="RR-I">Right Rear Inner (RR-I)</option>
          <option value="Spare">Spare</option>
        </select>
      </div>
      <div className="form-group"><label>Brand</label><input value={formData.brand || ''} onChange={e => onChange('brand', e.target.value)} placeholder="e.g. Michelin" /></div>
      <div className="form-group"><label>Model</label><input value={formData.model || ''} onChange={e => onChange('model', e.target.value)} placeholder="e.g. X Line Energy" /></div>
      <div className="form-group"><label>Size</label><input value={formData.size || ''} onChange={e => onChange('size', e.target.value)} placeholder="e.g. 295/75R22.5" /></div>
      <div className="form-group"><label>DOT Code</label><input value={formData.dot_code || ''} onChange={e => onChange('dot_code', e.target.value)} /></div>
      <div className="form-group"><label>Install Date</label><input type="date" value={formData.install_date?.split('T')[0] || ''} onChange={e => onChange('install_date', e.target.value)} /></div>
      <div className="form-group"><label>Mileage at Install</label><input type="number" value={formData.mileage_at_install || ''} onChange={e => onChange('mileage_at_install', e.target.value)} /></div>
      <div className="form-group"><label>Tread Depth (mm)</label><input type="number" step="0.1" value={formData.tread_depth || ''} onChange={e => onChange('tread_depth', e.target.value)} /></div>
      <div className="form-group"><label>Max Tread Depth (mm)</label><input type="number" step="0.1" value={formData.max_tread_depth || ''} onChange={e => onChange('max_tread_depth', e.target.value)} /></div>
      <div className="form-group"><label>Pressure (PSI)</label><input type="number" step="0.1" value={formData.pressure_psi || ''} onChange={e => onChange('pressure_psi', e.target.value)} /></div>
      <div className="form-group"><label>Recommended PSI</label><input type="number" step="0.1" value={formData.recommended_psi || ''} onChange={e => onChange('recommended_psi', e.target.value)} /></div>
      <div className="form-group"><label>Condition</label>
        <select value={formData.condition || 'good'} onChange={e => onChange('condition', e.target.value)}>
          <option value="good">Good</option><option value="fair">Fair</option><option value="worn">Worn</option><option value="critical">Critical</option>
        </select>
      </div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || 'active'} onChange={e => onChange('status', e.target.value)}>
          <option value="active">Active</option><option value="replaced">Replaced</option><option value="spare">Spare</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading tires...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🛞</span>Tire Management</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Tire</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">🛞</span><p>No tire records found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr>
          <th>Vehicle</th><th>Position</th><th>Brand</th><th>Size</th><th>Tread Depth</th><th>Pressure</th><th>Condition</th><th>Status</th>
        </tr></thead><tbody>
          {items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_code || item.vehicle_id || '-'}</td>
              <td>{item.position}</td><td>{item.brand} {item.model || ''}</td><td>{item.size}</td>
              <td>{item.tread_depth}/{item.max_tread_depth} mm</td>
              <td>{item.pressure_psi} PSI</td>
              <td><span className={getBadgeClass(item.condition)}>{item.condition}</span></td>
              <td><span className={getBadgeClass(item.status)}>{item.status}</span></td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Tire' : 'Tire Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_code || vehicleName(selectedItem.vehicle_id)}</span></div>
                  <div className="detail-field"><span className="detail-label">Position</span><span className="detail-value">{selectedItem.position}</span></div>
                  <div className="detail-field"><span className="detail-label">Brand</span><span className="detail-value">{selectedItem.brand}</span></div>
                  <div className="detail-field"><span className="detail-label">Model</span><span className="detail-value">{selectedItem.model || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Size</span><span className="detail-value">{selectedItem.size}</span></div>
                  <div className="detail-field"><span className="detail-label">DOT Code</span><span className="detail-value">{selectedItem.dot_code || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Install Date</span><span className="detail-value">{selectedItem.install_date?.split('T')[0] || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Mileage at Install</span><span className="detail-value">{selectedItem.mileage_at_install?.toLocaleString() || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Tread Depth</span><span className="detail-value">{selectedItem.tread_depth}/{selectedItem.max_tread_depth} mm</span></div>
                  <div className="detail-field"><span className="detail-label">Pressure</span><span className="detail-value">{selectedItem.pressure_psi} / {selectedItem.recommended_psi} PSI</span></div>
                  <div className="detail-field"><span className="detail-label">Condition</span><span className="detail-value"><span className={getBadgeClass(selectedItem.condition)}>{selectedItem.condition}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadgeClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field full-width"><span className="detail-label">Notes</span><span className="detail-value">{selectedItem.notes || '-'}</span></div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {isEditing ? (<><button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button></>) : (<><button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem.id)}>Delete</button><button className="btn btn-primary btn-sm" onClick={startEdit}>Edit</button></>)}
            </div>
          </div>
        </div>
      )}
      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Tire</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Tire</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
