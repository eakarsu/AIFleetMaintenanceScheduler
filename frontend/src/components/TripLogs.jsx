import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', driver_id: '', trip_number: '', origin: '', destination: '',
  departure_date: '', arrival_date: '', start_odometer: '', end_odometer: '',
  distance_miles: '', fuel_used: '', cargo_type: '', cargo_weight: '',
  revenue: '', tolls: '', status: 'planned', notes: ''
};

export default function TripLogs() {
  const [items, setItems] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchItems(); fetchVehicles(); fetchDrivers(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getTripLogs(); setItems(Array.isArray(d) ? d : d.data || []); } catch (e) {} setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.data || []); } catch (e) {} };
  const fetchDrivers = async () => { try { const d = await api.getDrivers(); setDrivers(Array.isArray(d) ? d : d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createTripLog(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateTripLog(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this trip log?')) return; try { await api.deleteTripLog(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadgeClass = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  const fmtDate = (d) => { if (!d) return '-'; const dt = new Date(d); return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  const toLocalInput = (d) => { if (!d) return ''; try { return new Date(d).toISOString().slice(0, 16); } catch { return ''; } };

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Trip Number</label><input value={formData.trip_number || ''} onChange={e => onChange('trip_number', e.target.value)} placeholder="TRIP-2026-XXX" /></div>
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
      <div className="form-group"><label>Origin</label><input value={formData.origin || ''} onChange={e => onChange('origin', e.target.value)} placeholder="Starting city" /></div>
      <div className="form-group"><label>Destination</label><input value={formData.destination || ''} onChange={e => onChange('destination', e.target.value)} placeholder="Ending city" /></div>
      <div className="form-group"><label>Departure</label><input type="datetime-local" value={toLocalInput(formData.departure_date)} onChange={e => onChange('departure_date', e.target.value)} /></div>
      <div className="form-group"><label>Arrival</label><input type="datetime-local" value={toLocalInput(formData.arrival_date)} onChange={e => onChange('arrival_date', e.target.value)} /></div>
      <div className="form-group"><label>Start Odometer</label><input type="number" value={formData.start_odometer || ''} onChange={e => onChange('start_odometer', e.target.value)} /></div>
      <div className="form-group"><label>End Odometer</label><input type="number" value={formData.end_odometer || ''} onChange={e => onChange('end_odometer', e.target.value)} /></div>
      <div className="form-group"><label>Distance (mi)</label><input type="number" step="0.1" value={formData.distance_miles || ''} onChange={e => onChange('distance_miles', e.target.value)} /></div>
      <div className="form-group"><label>Fuel Used (gal)</label><input type="number" step="0.1" value={formData.fuel_used || ''} onChange={e => onChange('fuel_used', e.target.value)} /></div>
      <div className="form-group"><label>Cargo Type</label><input value={formData.cargo_type || ''} onChange={e => onChange('cargo_type', e.target.value)} placeholder="e.g. Refrigerated" /></div>
      <div className="form-group"><label>Cargo Weight (lbs)</label><input type="number" step="0.1" value={formData.cargo_weight || ''} onChange={e => onChange('cargo_weight', e.target.value)} /></div>
      <div className="form-group"><label>Revenue ($)</label><input type="number" step="0.01" value={formData.revenue || ''} onChange={e => onChange('revenue', e.target.value)} /></div>
      <div className="form-group"><label>Tolls ($)</label><input type="number" step="0.01" value={formData.tolls || ''} onChange={e => onChange('tolls', e.target.value)} /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || 'planned'} onChange={e => onChange('status', e.target.value)}>
          <option value="planned">Planned</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading trip logs...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🗺️</span>Trip Logs</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Trip</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">🗺️</span><p>No trip logs found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr>
          <th>Trip #</th><th>Vehicle</th><th>Driver</th><th>Origin</th><th>Destination</th><th>Departure</th><th>Distance</th><th>Revenue</th><th>Status</th>
        </tr></thead><tbody>
          {items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.trip_number}</td>
              <td>{item.vehicle_code || item.vehicle_id || '-'}</td>
              <td>{item.driver_name || item.driver_id || '-'}</td>
              <td>{item.origin}</td><td>{item.destination}</td>
              <td>{fmtDate(item.departure_date)}</td>
              <td>{item.distance_miles ? `${Number(item.distance_miles).toLocaleString()} mi` : '-'}</td>
              <td>{item.revenue ? `$${Number(item.revenue).toLocaleString()}` : '-'}</td>
              <td><span className={getBadgeClass(item.status)}>{(item.status || '').replace(/_/g, ' ')}</span></td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Trip' : 'Trip Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Trip #</span><span className="detail-value">{selectedItem.trip_number}</span></div>
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_code || selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Driver</span><span className="detail-value">{selectedItem.driver_name || selectedItem.driver_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Origin</span><span className="detail-value">{selectedItem.origin}</span></div>
                  <div className="detail-field"><span className="detail-label">Destination</span><span className="detail-value">{selectedItem.destination}</span></div>
                  <div className="detail-field"><span className="detail-label">Departure</span><span className="detail-value">{fmtDate(selectedItem.departure_date)}</span></div>
                  <div className="detail-field"><span className="detail-label">Arrival</span><span className="detail-value">{fmtDate(selectedItem.arrival_date)}</span></div>
                  <div className="detail-field"><span className="detail-label">Start Odometer</span><span className="detail-value">{selectedItem.start_odometer?.toLocaleString() || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">End Odometer</span><span className="detail-value">{selectedItem.end_odometer?.toLocaleString() || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Distance</span><span className="detail-value">{selectedItem.distance_miles ? `${Number(selectedItem.distance_miles).toLocaleString()} mi` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Fuel Used</span><span className="detail-value">{selectedItem.fuel_used ? `${selectedItem.fuel_used} gal` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Cargo</span><span className="detail-value">{selectedItem.cargo_type || '-'} ({selectedItem.cargo_weight ? `${Number(selectedItem.cargo_weight).toLocaleString()} lbs` : '-'})</span></div>
                  <div className="detail-field"><span className="detail-label">Revenue</span><span className="detail-value">${Number(selectedItem.revenue || 0).toLocaleString()}</span></div>
                  <div className="detail-field"><span className="detail-label">Tolls</span><span className="detail-value">${Number(selectedItem.tolls || 0).toLocaleString()}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadgeClass(selectedItem.status)}>{(selectedItem.status || '').replace(/_/g, ' ')}</span></span></div>
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
            <div className="modal-header"><h2>New Trip Log</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Trip</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
