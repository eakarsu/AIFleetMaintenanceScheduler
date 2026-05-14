import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', type: '', make: '', model: '', year: '', mileage: '',
  status: 'active', license_plate: '', vin: '', fuel_type: 'diesel',
  purchase_date: '', last_service_date: '', next_service_date: '', notes: ''
};

export default function Vehicles() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { fetchItems(page); }, [page]);

  const fetchItems = async (p = 1) => {
    setLoading(true);
    try {
      const data = await api.getVehicles(p);
      if (data && data.data) {
        setItems(data.data);
        setPagination(data.pagination);
      } else {
        setItems(Array.isArray(data) ? data : data.vehicles || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      await api.createVehicle(formData);
      setIsCreating(false);
      setFormData({ ...emptyForm });
      fetchItems();
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async () => {
    try {
      await api.updateVehicle(selectedItem.id, formData);
      setIsEditing(false);
      setSelectedItem(null);
      fetchItems();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.deleteVehicle(id);
      setSelectedItem(null);
      fetchItems();
    } catch (e) { console.error(e); }
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setIsEditing(false);
    setFormData({ ...item });
  };

  const openCreate = () => {
    setFormData({ ...emptyForm });
    setIsCreating(true);
  };

  const startEdit = () => {
    setFormData({ ...selectedItem });
    setIsEditing(true);
  };

  const onChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const getBadgeClass = (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '_');
    return `badge badge-${s}`;
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading vehicles...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🚛</span>Vehicles</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ New Vehicle</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state"><span className="empty-state-icon">🚛</span><p>No vehicles found</p></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle ID</th><th>Type</th><th>Make/Model</th><th>Year</th><th>Mileage</th><th>Status</th><th>License Plate</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => openDetail(item)}>
                  <td>{item.vehicle_id}</td>
                  <td>{item.type}</td>
                  <td>{item.make} {item.model}</td>
                  <td>{item.year}</td>
                  <td>{item.mileage?.toLocaleString()}</td>
                  <td><span className={getBadgeClass(item.status)}>{item.status}</span></td>
                  <td>{item.license_plate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Next</button>
            </div>
          )}
        </div>
      )}

      {/* Detail/Edit Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Vehicle' : 'Vehicle Details'}</h2>
              <button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button>
            </div>
            <div className="modal-body">
              {isEditing ? (
                <div className="detail-grid">
                  <div className="form-group"><label>Vehicle ID</label><input value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)} /></div>
                  <div className="form-group"><label>Type</label>
                    <select value={formData.type || ''} onChange={e => onChange('type', e.target.value)}>
                      <option value="">Select</option><option value="truck">Truck</option><option value="bus">Bus</option><option value="taxi">Taxi</option><option value="van">Van</option><option value="trailer">Trailer</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Make</label><input value={formData.make || ''} onChange={e => onChange('make', e.target.value)} /></div>
                  <div className="form-group"><label>Model</label><input value={formData.model || ''} onChange={e => onChange('model', e.target.value)} /></div>
                  <div className="form-group"><label>Year</label><input type="number" value={formData.year || ''} onChange={e => onChange('year', e.target.value)} /></div>
                  <div className="form-group"><label>Mileage</label><input type="number" value={formData.mileage || ''} onChange={e => onChange('mileage', e.target.value)} /></div>
                  <div className="form-group"><label>Status</label>
                    <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
                      <option value="active">Active</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group"><label>License Plate</label><input value={formData.license_plate || ''} onChange={e => onChange('license_plate', e.target.value)} /></div>
                  <div className="form-group"><label>VIN</label><input value={formData.vin || ''} onChange={e => onChange('vin', e.target.value)} /></div>
                  <div className="form-group"><label>Fuel Type</label>
                    <select value={formData.fuel_type || ''} onChange={e => onChange('fuel_type', e.target.value)}>
                      <option value="diesel">Diesel</option><option value="gasoline">Gasoline</option><option value="electric">Electric</option><option value="hybrid">Hybrid</option><option value="cng">CNG</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Purchase Date</label><input type="date" value={formData.purchase_date?.split('T')[0] || ''} onChange={e => onChange('purchase_date', e.target.value)} /></div>
                  <div className="form-group"><label>Last Service Date</label><input type="date" value={formData.last_service_date?.split('T')[0] || ''} onChange={e => onChange('last_service_date', e.target.value)} /></div>
                  <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
                </div>
              ) : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle ID</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value">{selectedItem.type}</span></div>
                  <div className="detail-field"><span className="detail-label">Make</span><span className="detail-value">{selectedItem.make}</span></div>
                  <div className="detail-field"><span className="detail-label">Model</span><span className="detail-value">{selectedItem.model}</span></div>
                  <div className="detail-field"><span className="detail-label">Year</span><span className="detail-value">{selectedItem.year}</span></div>
                  <div className="detail-field"><span className="detail-label">Mileage</span><span className="detail-value">{selectedItem.mileage?.toLocaleString()}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadgeClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field"><span className="detail-label">License Plate</span><span className="detail-value">{selectedItem.license_plate}</span></div>
                  <div className="detail-field"><span className="detail-label">VIN</span><span className="detail-value">{selectedItem.vin}</span></div>
                  <div className="detail-field"><span className="detail-label">Fuel Type</span><span className="detail-value">{selectedItem.fuel_type}</span></div>
                  <div className="detail-field"><span className="detail-label">Purchase Date</span><span className="detail-value">{selectedItem.purchase_date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Last Service</span><span className="detail-value">{selectedItem.last_service_date?.split('T')[0]}</span></div>
                  <div className="detail-field full-width"><span className="detail-label">Notes</span><span className="detail-value">{selectedItem.notes || '-'}</span></div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {isEditing ? (
                <>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
                </>
              ) : (
                <>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem.id)}>Delete</button>
                  <button className="btn btn-primary btn-sm" onClick={startEdit}>Edit</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Vehicle</h2>
              <button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="form-group"><label>Vehicle ID</label><input value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)} placeholder="e.g. VH-001" /></div>
                <div className="form-group"><label>Type</label>
                  <select value={formData.type || ''} onChange={e => onChange('type', e.target.value)}>
                    <option value="">Select Type</option><option value="truck">Truck</option><option value="bus">Bus</option><option value="taxi">Taxi</option><option value="van">Van</option><option value="trailer">Trailer</option>
                  </select>
                </div>
                <div className="form-group"><label>Make</label><input value={formData.make || ''} onChange={e => onChange('make', e.target.value)} placeholder="e.g. Ford" /></div>
                <div className="form-group"><label>Model</label><input value={formData.model || ''} onChange={e => onChange('model', e.target.value)} placeholder="e.g. F-150" /></div>
                <div className="form-group"><label>Year</label><input type="number" value={formData.year || ''} onChange={e => onChange('year', e.target.value)} placeholder="2024" /></div>
                <div className="form-group"><label>Mileage</label><input type="number" value={formData.mileage || ''} onChange={e => onChange('mileage', e.target.value)} placeholder="0" /></div>
                <div className="form-group"><label>Status</label>
                  <select value={formData.status || 'active'} onChange={e => onChange('status', e.target.value)}>
                    <option value="active">Active</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group"><label>License Plate</label><input value={formData.license_plate || ''} onChange={e => onChange('license_plate', e.target.value)} placeholder="ABC-1234" /></div>
                <div className="form-group"><label>VIN</label><input value={formData.vin || ''} onChange={e => onChange('vin', e.target.value)} placeholder="VIN number" /></div>
                <div className="form-group"><label>Fuel Type</label>
                  <select value={formData.fuel_type || 'diesel'} onChange={e => onChange('fuel_type', e.target.value)}>
                    <option value="diesel">Diesel</option><option value="gasoline">Gasoline</option><option value="electric">Electric</option><option value="hybrid">Hybrid</option><option value="cng">CNG</option>
                  </select>
                </div>
                <div className="form-group"><label>Purchase Date</label><input type="date" value={formData.purchase_date || ''} onChange={e => onChange('purchase_date', e.target.value)} /></div>
                <div className="form-group"><label>Last Service Date</label><input type="date" value={formData.last_service_date || ''} onChange={e => onChange('last_service_date', e.target.value)} /></div>
                <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} placeholder="Any additional notes..." /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
