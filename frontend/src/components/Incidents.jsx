import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  vehicle_id: '', driver_id: '', incident_type: '', date: '', time: '', location: '', description: '',
  severity: 'minor', injuries: false, injury_details: '', police_report_number: '',
  insurance_claim_number: '', estimated_damage: '', repair_status: 'pending', fault: 'undetermined',
  witnesses: '', photos_count: '0', status: 'open'
};

export default function Incidents() {
  const [items, setItems] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchItems(); fetchVehicles(); fetchDrivers(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getIncidents(); setItems(Array.isArray(d) ? d : d.data || []); } catch (e) {} setLoading(false); };
  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.data || []); } catch (e) {} };
  const fetchDrivers = async () => { try { const d = await api.getDrivers(); setDrivers(Array.isArray(d) ? d : d.data || []); } catch (e) {} };

  const handleCreate = async () => { try { await api.createIncident(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updateIncident(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this incident report?')) return; try { await api.deleteIncident(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
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
      <div className="form-group"><label>Driver</label>
        <select value={formData.driver_id || ''} onChange={e => onChange('driver_id', e.target.value)}>
          <option value="">Select Driver</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Incident Type</label>
        <select value={formData.incident_type || ''} onChange={e => onChange('incident_type', e.target.value)}>
          <option value="">Select</option><option value="collision">Collision</option><option value="backing">Backing Accident</option>
          <option value="tire_blowout">Tire Blowout</option><option value="rollover">Rollover</option><option value="weather">Weather Related</option>
          <option value="cargo_spill">Cargo Spill</option><option value="mechanical_failure">Mechanical Failure</option><option value="other">Other</option>
        </select>
      </div>
      <div className="form-group"><label>Date</label><input type="date" value={formData.date?.split('T')[0] || ''} onChange={e => onChange('date', e.target.value)} /></div>
      <div className="form-group"><label>Time</label><input type="time" value={formData.time || ''} onChange={e => onChange('time', e.target.value)} /></div>
      <div className="form-group"><label>Severity</label>
        <select value={formData.severity || 'minor'} onChange={e => onChange('severity', e.target.value)}>
          <option value="minor">Minor</option><option value="moderate">Moderate</option><option value="major">Major</option><option value="critical">Critical</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Location</label><input value={formData.location || ''} onChange={e => onChange('location', e.target.value)} placeholder="Address or intersection" /></div>
      <div className="form-group full-width"><label>Description</label><textarea value={formData.description || ''} onChange={e => onChange('description', e.target.value)} placeholder="Detailed description of the incident" /></div>
      <div className="form-group"><label>Injuries</label>
        <select value={formData.injuries ? 'true' : 'false'} onChange={e => onChange('injuries', e.target.value === 'true')}>
          <option value="false">No</option><option value="true">Yes</option>
        </select>
      </div>
      {formData.injuries && <div className="form-group full-width"><label>Injury Details</label><textarea value={formData.injury_details || ''} onChange={e => onChange('injury_details', e.target.value)} /></div>}
      <div className="form-group"><label>Police Report #</label><input value={formData.police_report_number || ''} onChange={e => onChange('police_report_number', e.target.value)} /></div>
      <div className="form-group"><label>Insurance Claim #</label><input value={formData.insurance_claim_number || ''} onChange={e => onChange('insurance_claim_number', e.target.value)} /></div>
      <div className="form-group"><label>Estimated Damage ($)</label><input type="number" step="0.01" value={formData.estimated_damage || ''} onChange={e => onChange('estimated_damage', e.target.value)} /></div>
      <div className="form-group"><label>Repair Status</label>
        <select value={formData.repair_status || 'pending'} onChange={e => onChange('repair_status', e.target.value)}>
          <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="totaled">Totaled</option>
        </select>
      </div>
      <div className="form-group"><label>Fault</label>
        <select value={formData.fault || 'undetermined'} onChange={e => onChange('fault', e.target.value)}>
          <option value="undetermined">Undetermined</option><option value="driver">Driver</option><option value="other_party">Other Party</option><option value="shared">Shared</option>
        </select>
      </div>
      <div className="form-group"><label>Photos Count</label><input type="number" value={formData.photos_count || '0'} onChange={e => onChange('photos_count', e.target.value)} /></div>
      <div className="form-group full-width"><label>Witnesses</label><textarea value={formData.witnesses || ''} onChange={e => onChange('witnesses', e.target.value)} /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || 'open'} onChange={e => onChange('status', e.target.value)}>
          <option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
        </select>
      </div>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading incidents...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">⚠️</span>Incident Reports</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Incident</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">⚠️</span><p>No incidents found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr>
          <th>Vehicle</th><th>Driver</th><th>Type</th><th>Date</th><th>Severity</th><th>Damage Est.</th><th>Repair</th><th>Status</th>
        </tr></thead><tbody>
          {items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.vehicle_code || item.vehicle_id || '-'}</td>
              <td>{item.driver_name || item.driver_id || '-'}</td>
              <td>{(item.incident_type || '').replace(/_/g, ' ')}</td>
              <td>{item.date?.split('T')[0]}</td>
              <td><span className={getBadgeClass(item.severity)}>{item.severity}</span></td>
              <td>${Number(item.estimated_damage || 0).toLocaleString()}</td>
              <td><span className={getBadgeClass(item.repair_status)}>{(item.repair_status || '').replace(/_/g, ' ')}</span></td>
              <td><span className={getBadgeClass(item.status)}>{item.status}</span></td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Incident' : 'Incident Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Vehicle</span><span className="detail-value">{selectedItem.vehicle_code || selectedItem.vehicle_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Driver</span><span className="detail-value">{selectedItem.driver_name || selectedItem.driver_id}</span></div>
                  <div className="detail-field"><span className="detail-label">Type</span><span className="detail-value">{(selectedItem.incident_type || '').replace(/_/g, ' ')}</span></div>
                  <div className="detail-field"><span className="detail-label">Date</span><span className="detail-value">{selectedItem.date?.split('T')[0]}</span></div>
                  <div className="detail-field"><span className="detail-label">Time</span><span className="detail-value">{selectedItem.time || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Severity</span><span className="detail-value"><span className={getBadgeClass(selectedItem.severity)}>{selectedItem.severity}</span></span></div>
                  <div className="detail-field full-width"><span className="detail-label">Location</span><span className="detail-value">{selectedItem.location || '-'}</span></div>
                  <div className="detail-field full-width"><span className="detail-label">Description</span><span className="detail-value">{selectedItem.description}</span></div>
                  <div className="detail-field"><span className="detail-label">Injuries</span><span className="detail-value">{selectedItem.injuries ? 'Yes' : 'No'}</span></div>
                  {selectedItem.injuries && <div className="detail-field full-width"><span className="detail-label">Injury Details</span><span className="detail-value">{selectedItem.injury_details}</span></div>}
                  <div className="detail-field"><span className="detail-label">Police Report #</span><span className="detail-value">{selectedItem.police_report_number || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Insurance Claim #</span><span className="detail-value">{selectedItem.insurance_claim_number || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Estimated Damage</span><span className="detail-value">${Number(selectedItem.estimated_damage || 0).toLocaleString()}</span></div>
                  <div className="detail-field"><span className="detail-label">Repair Status</span><span className="detail-value"><span className={getBadgeClass(selectedItem.repair_status)}>{selectedItem.repair_status}</span></span></div>
                  <div className="detail-field"><span className="detail-label">Fault</span><span className="detail-value">{selectedItem.fault}</span></div>
                  <div className="detail-field"><span className="detail-label">Photos</span><span className="detail-value">{selectedItem.photos_count}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadgeClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                  <div className="detail-field full-width"><span className="detail-label">Witnesses</span><span className="detail-value">{selectedItem.witnesses || '-'}</span></div>
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
            <div className="modal-header"><h2>New Incident Report</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Report</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
