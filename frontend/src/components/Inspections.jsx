import { useState, useEffect } from 'react';
import * as api from '../services/api';

const checkItems = ['brakes','tires_check','lights','fluids','engine','transmission','steering','exhaust','body_exterior','safety_equipment'];
const checkLabels = { brakes:'Brakes', tires_check:'Tires', lights:'Lights', fluids:'Fluids', engine:'Engine', transmission:'Transmission', steering:'Steering', exhaust:'Exhaust', body_exterior:'Body/Exterior', safety_equipment:'Safety Equipment' };

const emptyForm = {
  vehicle_id: '', driver_id: '', inspection_type: 'pre_trip', date: '', time: '', odometer: '',
  overall_status: 'pass', brakes: 'ok', tires_check: 'ok', lights: 'ok', fluids: 'ok', engine: 'ok',
  transmission: 'ok', steering: 'ok', exhaust: 'ok', body_exterior: 'ok', safety_equipment: 'ok',
  defects_found: '', corrective_action: '', inspector_signature: '', status: 'completed'
};

export default function Inspections() {
  const [items, setItems] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchItems(); fetchVehicles(); fetchDrivers(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getInspections(); setItems(Array.isArray(d) ? d : d.data || []); } catch (e) {} setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.data || []); } catch (e) {} };
  const fetchDrivers = async () => { try { const d = await api.getDrivers(); setDrivers(Array.isArray(d) ? d : d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createInspection(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateInspection(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this inspection?')) return; try { await api.deleteInspection(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
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
      <div className="form-group"><label>Driver / Inspector</label>
        <select value={formData.driver_id || ''} onChange={e => onChange('driver_id', e.target.value)}>
          <option value="">Select Driver</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Inspection Type</label>
        <select value={formData.inspection_type || ''} onChange={e => onChange('inspection_type', e.target.value)}>
          <option value="pre_trip">Pre-Trip</option><option value="post_trip">Post-Trip</option><option value="annual">Annual</option><option value="random">Random</option>
        </select>
      </div>
      <div className="form-group"><label>Date</label><input type="date" value={formData.date?.split('T')[0] || ''} onChange={e => onChange('date', e.target.value)} /></div>
      <div className="form-group"><label>Time</label><input type="time" value={formData.time || ''} onChange={e => onChange('time', e.target.value)} /></div>
      <div className="form-group"><label>Odometer</label><input type="number" value={formData.odometer || ''} onChange={e => onChange('odometer', e.target.value)} /></div>
      <div className="form-group"><label>Overall Status</label>
        <select value={formData.overall_status || 'pass'} onChange={e => onChange('overall_status', e.target.value)}>
          <option value="pass">Pass</option><option value="fail">Fail</option><option value="conditional">Conditional</option>
        </select>
      </div>
      <div className="form-group"><label>Inspector Signature</label><input value={formData.inspector_signature || ''} onChange={e => onChange('inspector_signature', e.target.value)} placeholder="Full name" /></div>
      {checkItems.map(c => (
        <div className="form-group" key={c}><label>{checkLabels[c]}</label>
          <select value={formData[c] || 'ok'} onChange={e => onChange(c, e.target.value)}>
            <option value="ok">OK</option><option value="defect">Defect</option><option value="na">N/A</option>
          </select>
        </div>
      ))}
      <div className="form-group full-width"><label>Defects Found</label><textarea value={formData.defects_found || ''} onChange={e => onChange('defects_found', e.target.value)} /></div>
      <div className="form-group full-width"><label>Corrective Action</label><textarea value={formData.corrective_action || ''} onChange={e => onChange('corrective_action', e.target.value)} /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || 'completed'} onChange={e => onChange('status', e.target.value)}>
          <option value="completed">Completed</option><option value="pending">Pending</option><option value="requires_repair">Requires Repair</option>
        </select>
      </div>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading inspections...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">📝</span>Inspection Checklists</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Inspection</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">📝</span><p>No inspections found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr>
          <th>Vehicle</th><th>Driver</th><th>Type</th><th>Date</th><th>Overall</th><th>Defects</th><th>Status</th>
        </tr></thead><tbody>
          {items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_code || item.vehicle_id || '-'}</td>
              <td>{item.driver_name || item.driver_id || '-'}</td>
              <td>{(item.inspection_type || '').replace('_', '-')}</td>
              <td>{item.date?.split('T')[0]}</td>
              <td><span className={getBadgeClass(item.overall_status)}>{item.overall_status}</span></td>
              <td>{item.defects_found ? item.defects_found.substring(0, 40) + '...' : 'None'}</td>
              <td><span className={getBadgeClass(item.status)}>{item.status}</span></td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Inspection' : 'Inspection Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_code || selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Driver</span><span className="detail-value">{selectedItem.driver_name || selectedItem.driver_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value">{selectedItem.inspection_type}</span></div>
                  <div className="detail-field"><span className="detail-label">Date</span><span className="detail-value">{selectedItem.date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Time</span><span className="detail-value">{selectedItem.time || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Odometer</span><span className="detail-value">{selectedItem.odometer?.toLocaleString() || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Overall Status</span><span className="detail-value"><span className={getBadgeClass(selectedItem.overall_status)}>{selectedItem.overall_status}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Inspector</span><span className="detail-value">{selectedItem.inspector_signature || '-'}</span></div>
                  {checkItems.map(c => (
                    <div className="detail-field" key={c}><span className="detail-label">{checkLabels[c]}</span><span className="detail-value"><span className={getBadgeClass(selectedItem[c])}>{selectedItem[c]}</span></span></div>
                  ))}
                  <div className="detail-field full-width"><span className="detail-label">Defects Found</span><span className="detail-value">{selectedItem.defects_found || 'None'}</span></div>
                  <div className="detail-field full-width"><span className="detail-label">Corrective Action</span><span className="detail-value">{selectedItem.corrective_action || '-'}</span></div>
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
            <div className="modal-header"><h2>New Inspection</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Inspection</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
