import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', driver_id: '', date: '', gallons: '', cost_per_gallon: '',
  total_cost: '', odometer: '', mpg: '', fuel_type: 'diesel', station: '', notes: ''
};

export default function Fuel() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => { fetchItems(); fetchVehicles(); fetchDrivers(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getFuelRecords(); setItems(Array.isArray(d) ? d : d.records || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };
  const fetchDrivers = async () => { try { const d = await api.getDrivers(); setDrivers(Array.isArray(d) ? d : d.drivers || d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createFuelRecord(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateFuelRecord(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this fuel record?')) return; try { await api.deleteFuelRecord(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading fuel records...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Vehicle</label>
        <select value={formData.vehicle_id || ''} onChange={e => onChange('vehicle_id', e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Driver</label>
        <select value={formData.driver_id || ''} onChange={e => onChange('driver_id', e.target.value)}>
          <option value="">Select Driver</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Date</label><input type="date" value={formData.date?.split('T')[0] || ''} onChange={e => onChange('date', e.target.value)} /></div>
      <div className="form-group"><label>Gallons</label><input type="number" step="0.01" value={formData.gallons || ''} onChange={e => onChange('gallons', e.target.value)} /></div>
      <div className="form-group"><label>Cost/Gallon ($)</label><input type="number" step="0.01" value={formData.cost_per_gallon || ''} onChange={e => onChange('cost_per_gallon', e.target.value)} /></div>
      <div className="form-group"><label>Total Cost ($)</label><input type="number" step="0.01" value={formData.total_cost || ''} onChange={e => onChange('total_cost', e.target.value)} /></div>
      <div className="form-group"><label>Odometer</label><input type="number" value={formData.odometer || ''} onChange={e => onChange('odometer', e.target.value)} /></div>
      <div className="form-group"><label>MPG</label><input type="number" step="0.1" value={formData.mpg || ''} onChange={e => onChange('mpg', e.target.value)} /></div>
      <div className="form-group"><label>Fuel Type</label>
        <select value={formData.fuel_type || ''} onChange={e => onChange('fuel_type', e.target.value)}>
          <option value="diesel">Diesel</option><option value="gasoline">Gasoline</option><option value="electric">Electric</option><option value="cng">CNG</option>
        </select>
      </div>
      <div className="form-group"><label>Station</label><input value={formData.station || ''} onChange={e => onChange('station', e.target.value)} /></div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">⛽</span>Fuel Records</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Record</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">⛽</span><p>No fuel records found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Vehicle</th><th>Driver</th><th>Date</th><th>Gallons</th><th>$/Gal</th><th>Total Cost</th><th>MPG</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_id}</td><td>{item.driver_id}</td><td>{item.date?.split('T')[0]}</td>
              <td>{item.gallons}</td><td>{item.cost_per_gallon ? `$${Number(item.cost_per_gallon).toFixed(2)}` : '-'}</td>
              <td>{item.total_cost ? `$${Number(item.total_cost).toFixed(2)}` : '-'}</td>
              <td>{item.mpg || '-'}</td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Fuel Record' : 'Fuel Record Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Driver</span><span className="detail-value">{selectedItem.driver_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Date</span><span className="detail-value">{selectedItem.date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Gallons</span><span className="detail-value">{selectedItem.gallons}</span></div>
                  <div className="detail-field"><span className="detail-label">Cost/Gallon</span><span className="detail-value">{selectedItem.cost_per_gallon ? `$${Number(selectedItem.cost_per_gallon).toFixed(2)}` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Total Cost</span><span className="detail-value">{selectedItem.total_cost ? `$${Number(selectedItem.total_cost).toFixed(2)}` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Odometer</span><span className="detail-value">{selectedItem.odometer || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">MPG</span><span className="detail-value">{selectedItem.mpg || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Fuel Type</span><span className="detail-value">{selectedItem.fuel_type || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Station</span><span className="detail-value">{selectedItem.station || '-'}</span></div>
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
            <div className="modal-header"><h2>New Fuel Record</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
