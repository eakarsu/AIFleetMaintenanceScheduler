import { useState, useEffect } from 'react';
import * as api from '../services/api';

const emptyForm = {
  part_number: '', name: '', category: '', quantity: 0, minimum_quantity: 0,
  unit_cost: '', supplier: '', location: '', status: 'in_stock', notes: ''
};

export default function Parts() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => { setLoading(true); try { const d = await api.getParts(); setItems(Array.isArray(d) ? d : d.parts || d.data || []); } catch (e) { console.error(e); } setLoading(false); };
  const handleCreate = async () => { try { await api.createPart(formData); setIsCreating(false); setFormData({ ...emptyForm }); fetchItems(); } catch (e) { console.error(e); } };
  const handleUpdate = async () => { try { await api.updatePart(selectedItem.id, formData); setIsEditing(false); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete this part?')) return; try { await api.deletePart(id); setSelectedItem(null); fetchItems(); } catch (e) { console.error(e); } };

  const openDetail = (item) => { setSelectedItem(item); setIsEditing(false); setFormData({ ...item }); };
  const openCreate = () => { setFormData({ ...emptyForm }); setIsCreating(true); };
  const startEdit = () => { setFormData({ ...selectedItem }); setIsEditing(true); };
  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const getBadge = (s) => `badge badge-${(s || '').toLowerCase().replace(/\s+/g, '_')}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading parts...</span></div>;

  const renderForm = () => (
    <div className="detail-grid">
      <div className="form-group"><label>Part Number</label><input value={formData.part_number || ''} onChange={e => onChange('part_number', e.target.value)} placeholder="e.g. PT-001" /></div>
      <div className="form-group"><label>Name</label><input value={formData.name || ''} onChange={e => onChange('name', e.target.value)} placeholder="Part name" /></div>
      <div className="form-group"><label>Category</label>
        <select value={formData.category || ''} onChange={e => onChange('category', e.target.value)}>
          <option value="">Select</option><option value="engine">Engine</option><option value="brakes">Brakes</option><option value="transmission">Transmission</option><option value="electrical">Electrical</option><option value="suspension">Suspension</option><option value="tires">Tires</option><option value="filters">Filters</option><option value="fluids">Fluids</option>
        </select>
      </div>
      <div className="form-group"><label>Quantity</label><input type="number" value={formData.quantity || ''} onChange={e => onChange('quantity', parseInt(e.target.value) || 0)} /></div>
      <div className="form-group"><label>Minimum Quantity</label><input type="number" value={formData.minimum_quantity || ''} onChange={e => onChange('minimum_quantity', parseInt(e.target.value) || 0)} /></div>
      <div className="form-group"><label>Unit Cost ($)</label><input type="number" step="0.01" value={formData.unit_cost || ''} onChange={e => onChange('unit_cost', e.target.value)} /></div>
      <div className="form-group"><label>Supplier</label><input value={formData.supplier || ''} onChange={e => onChange('supplier', e.target.value)} /></div>
      <div className="form-group"><label>Location</label><input value={formData.location || ''} onChange={e => onChange('location', e.target.value)} placeholder="Warehouse location" /></div>
      <div className="form-group"><label>Status</label>
        <select value={formData.status || ''} onChange={e => onChange('status', e.target.value)}>
          <option value="in_stock">In Stock</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option>
        </select>
      </div>
      <div className="form-group full-width"><label>Notes</label><textarea value={formData.notes || ''} onChange={e => onChange('notes', e.target.value)} /></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">⚙️</span>Parts Inventory</h1>
        <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ New Part</button></div>
      </div>
      {items.length === 0 ? <div className="empty-state"><span className="empty-state-icon">⚙️</span><p>No parts found</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>Part #</th><th>Name</th><th>Category</th><th>Qty</th><th>Min Qty</th><th>Unit Cost</th><th>Status</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id} onClick={() => openDetail(item)}>
              <td>{item.part_number}</td><td>{item.name}</td><td>{item.category}</td><td>{item.quantity}</td><td>{item.minimum_quantity}</td>
              <td>{item.unit_cost ? `$${Number(item.unit_cost).toFixed(2)}` : '-'}</td>
              <td><span className={getBadge(item.status)}>{item.status}</span></td>
            </tr>
          ))}</tbody></table></div>
      )}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditing ? 'Edit Part' : 'Part Details'}</h2><button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>&times;</button></div>
            <div className="modal-body">
              {isEditing ? renderForm() : (
                <div className="detail-grid">
                  <div className="detail-field"><span className="detail-label">Part Number</span><span className="detail-value">{selectedItem.part_number}</span></div>
                  <div className="detail-field"><span className="detail-label">Name</span><span className="detail-value">{selectedItem.name}</span></div>
                  <div className="detail-field"><span className="detail-label">Category</span><span className="detail-value">{selectedItem.category}</span></div>
                  <div className="detail-field"><span className="detail-label">Quantity</span><span className="detail-value">{selectedItem.quantity}</span></div>
                  <div className="detail-field"><span className="detail-label">Min Quantity</span><span className="detail-value">{selectedItem.minimum_quantity}</span></div>
                  <div className="detail-field"><span className="detail-label">Unit Cost</span><span className="detail-value">{selectedItem.unit_cost ? `$${Number(selectedItem.unit_cost).toFixed(2)}` : '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Supplier</span><span className="detail-value">{selectedItem.supplier || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Location</span><span className="detail-value">{selectedItem.location || '-'}</span></div>
                  <div className="detail-field"><span className="detail-label">Status</span><span className="detail-value"><span className={getBadge(selectedItem.status)}>{selectedItem.status}</span></span></div>
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
            <div className="modal-header"><h2>New Part</h2><button className="modal-close" onClick={() => setIsCreating(false)}>&times;</button></div>
            <div className="modal-body">{renderForm()}</div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
