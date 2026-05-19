import { useState, useEffect } from 'react';

// NON-VIZ: PM Checklist PDF generator
export default function PMChecklistPdf() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vehicles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.vehicles || data.data || []);
        setVehicles(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPdf = async (forDownload) => {
    setLoading(true);
    setStatus('');
    try {
      const token = localStorage.getItem('token');
      const url = `/api/custom-views/pm-checklist-pdf${vehicleId ? `?vehicle_id=${vehicleId}` : ''}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      if (forDownload) {
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = `pm-checklist-${vehicleId || 'all'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setStatus('PDF downloaded');
      } else {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(objUrl);
        setStatus('Preview ready');
      }
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div data-testid="cv-pm-checklist-pdf" style={{ background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>PM Checklist PDF</h3>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Generate a printable preventive maintenance checklist (PDF) per vehicle or for all vehicles.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, marginBottom: 4 }}>Vehicle</label>
          <select
            value={vehicleId}
            onChange={e => setVehicleId(e.target.value)}
            style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155', padding: '6px 10px', borderRadius: 4, minWidth: 260 }}
          >
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.vehicle_id} - {v.make} {v.model} ({v.year})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => fetchPdf(false)}
          disabled={loading}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          {loading ? 'Generating...' : 'Preview PDF'}
        </button>
        <button
          onClick={() => fetchPdf(true)}
          disabled={loading}
          style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          Download PDF
        </button>
      </div>

      {status && <div style={{ color: status.startsWith('Error') ? '#ef4444' : '#22c55e', fontSize: 12, marginBottom: 8 }}>{status}</div>}

      {previewUrl && (
        <iframe
          title="PM Checklist Preview"
          src={previewUrl}
          style={{ width: '100%', height: 480, border: '1px solid #334155', background: '#fff', borderRadius: 4 }}
        />
      )}
    </div>
  );
}
