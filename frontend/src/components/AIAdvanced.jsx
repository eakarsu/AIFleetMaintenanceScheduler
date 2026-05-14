import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as api from '../services/api';

/**
 * Surfaces the 3 new AI endpoints from backend/routes/ai.js:
 *   POST /api/ai/parts-order-predict
 *   POST /api/ai/technician-assign-optimize
 *   POST /api/ai/warranty-claim-assist
 *
 * Reuses existing app classNames (ai-card, ai-card-body, btn, ai-loading, ai-response).
 */

function jsonToMarkdown(obj, depth = 0) {
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    return obj
      .map((item) => {
        if (typeof item === 'object' && item !== null) return jsonToMarkdown(item, depth + 1);
        return `- ${item}`;
      })
      .join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj)
      .map(([key, value]) => {
        const heading = '#'.repeat(Math.min(depth + 2, 4));
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return `**${label}:** ${value}`;
        }
        return `${heading} ${label}\n\n${jsonToMarkdown(value, depth + 1)}`;
      })
      .join('\n\n');
  }
  return String(obj);
}

function pickContent(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  let raw = data.analysis || data.result || data.recommendations || data.report || data.response || data.data || data.message || data;
  if (typeof raw === 'string') {
    // Try to parse JSON inside code fences
    const stripped = raw.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
    const m = stripped.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return jsonToMarkdown(JSON.parse(m[0]));
      } catch (_) { /* keep raw */ }
    }
    return raw;
  }
  return jsonToMarkdown(raw);
}

function AIBlock({ title, icon, children }) {
  return (
    <div className="ai-card">
      <div className="ai-card-header">
        <h3>
          <span>{icon}</span> {title}
        </h3>
      </div>
      <div className="ai-card-body">{children}</div>
    </div>
  );
}

function ResponseView({ data, loading, error }) {
  if (loading) {
    return (
      <div className="ai-loading">
        <div className="spinner"></div>
        <span className="ai-loading-text">AI is analyzing...</span>
      </div>
    );
  }
  if (error) {
    return <div className="ai-response"><p style={{ color: 'var(--accent-red)' }}>{error}</p></div>;
  }
  if (!data) return null;
  const content = pickContent(data);
  return (
    <div className="ai-response">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default function AIAdvanced() {
  // Parts order predict
  const [partsForm, setPartsForm] = useState({ lookback_days: 30, horizon_days: 30 });
  const [partsData, setPartsData] = useState(null);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState('');

  // Technician assignment
  const [techNotes, setTechNotes] = useState('');
  const [techData, setTechData] = useState(null);
  const [techLoading, setTechLoading] = useState(false);
  const [techError, setTechError] = useState('');

  // Warranty claim assistant
  const [warrantyForm, setWarrantyForm] = useState({ vehicle_id: '', issue_description: '', incident_date: '' });
  const [warrantyData, setWarrantyData] = useState(null);
  const [warrantyLoading, setWarrantyLoading] = useState(false);
  const [warrantyError, setWarrantyError] = useState('');

  const callApi = async (path, body) => {
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body || {}),
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || err.error || 'Request failed');
    }
    return res.json();
  };

  const runParts = async () => {
    setPartsLoading(true); setPartsError(''); setPartsData(null);
    try {
      const res = await callApi('/ai/parts-order-predict', {
        lookback_days: Number(partsForm.lookback_days) || 30,
        horizon_days: Number(partsForm.horizon_days) || 30,
      });
      setPartsData(res);
    } catch (e) { setPartsError(e.message); } finally { setPartsLoading(false); }
  };

  const runTech = async () => {
    setTechLoading(true); setTechError(''); setTechData(null);
    try {
      const res = await callApi('/ai/technician-assign-optimize', { notes: techNotes });
      setTechData(res);
    } catch (e) { setTechError(e.message); } finally { setTechLoading(false); }
  };

  const runWarranty = async () => {
    if (!warrantyForm.vehicle_id) { setWarrantyError('Vehicle ID is required'); return; }
    setWarrantyLoading(true); setWarrantyError(''); setWarrantyData(null);
    try {
      const res = await callApi('/ai/warranty-claim-assist', {
        vehicle_id: Number(warrantyForm.vehicle_id),
        issue_description: warrantyForm.issue_description,
        incident_date: warrantyForm.incident_date,
      });
      setWarrantyData(res);
    } catch (e) { setWarrantyError(e.message); } finally { setWarrantyLoading(false); }
  };

  // Hint to keep linter happy that `api` is intentionally not used here (we
  // call `/api/...` directly because there are no helpers for the new endpoints).
  void api;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🤖 AI Advanced</h1>
        <p>Parts ordering, technician assignment, and warranty claim assistant</p>
      </div>

      <div className="ai-grid">
        <AIBlock title="Parts Order Predict" icon="📦">
          <div className="form-row">
            <div className="form-group">
              <label>Lookback days</label>
              <input type="number" min="1" value={partsForm.lookback_days}
                onChange={(e) => setPartsForm({ ...partsForm, lookback_days: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Horizon days</label>
              <input type="number" min="1" value={partsForm.horizon_days}
                onChange={(e) => setPartsForm({ ...partsForm, horizon_days: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={runParts} disabled={partsLoading}>
            {partsLoading ? 'Predicting...' : 'Predict Parts Order'}
          </button>
          <ResponseView data={partsData} loading={partsLoading} error={partsError} />
        </AIBlock>

        <AIBlock title="Technician Assignment Optimize" icon="🔧">
          <div className="form-group">
            <label>Notes / constraints (optional)</label>
            <textarea
              rows={3}
              placeholder="Specializations, shift constraints, geography..."
              value={techNotes}
              onChange={(e) => setTechNotes(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={runTech} disabled={techLoading}>
            {techLoading ? 'Optimizing...' : 'Optimize Assignments'}
          </button>
          <ResponseView data={techData} loading={techLoading} error={techError} />
        </AIBlock>

        <AIBlock title="Warranty Claim Assistant" icon="🛡️">
          <div className="form-row">
            <div className="form-group">
              <label>Vehicle ID</label>
              <input type="number" value={warrantyForm.vehicle_id}
                onChange={(e) => setWarrantyForm({ ...warrantyForm, vehicle_id: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Incident date</label>
              <input type="date" value={warrantyForm.incident_date}
                onChange={(e) => setWarrantyForm({ ...warrantyForm, incident_date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Issue description</label>
            <textarea
              rows={3}
              placeholder="Failure mode, symptoms, mileage at failure..."
              value={warrantyForm.issue_description}
              onChange={(e) => setWarrantyForm({ ...warrantyForm, issue_description: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={runWarranty} disabled={warrantyLoading}>
            {warrantyLoading ? 'Assessing...' : 'Assess & Draft Claim'}
          </button>
          <ResponseView data={warrantyData} loading={warrantyLoading} error={warrantyError} />
        </AIBlock>
      </div>
    </div>
  );
}
