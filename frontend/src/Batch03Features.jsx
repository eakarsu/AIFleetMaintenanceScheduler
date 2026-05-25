// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated frontend page (lean v0). Wires Custom Feature Suggestions
// and Gap endpoints (AI counterparts + non-AI features) to backend routes.
import React, { useState } from 'react';

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:4000/api';

const FEATURES = [
  { kind: 'cfs', slug: 'cf-agentic-maintenance-coordinator', label: 'Agentic maintenance coordinator', desc: '"Fleet age average 6 years, downtime 15%" → agent analyzes failure patterns, recommends maintenance strategy, predicts budget needs', endpoint: '/cf-agentic-maintenance-coordinator' },
  { kind: 'cfs', slug: 'cf-predictive-maintenance', label: 'Predictive maintenance', desc: 'ML model predicts failures based on engine data, alerts before breakdown', endpoint: '/cf-predictive-maintenance' },
  { kind: 'cfs', slug: 'cf-automated-work-orders', label: 'Automated work orders', desc: 'System generates work orders based on maintenance schedules and predicted failures', endpoint: '/cf-automated-work-orders' },
  { kind: 'cfs', slug: 'cf-driver-behavior-analytics', label: 'Driver behavior analytics', desc: 'Correlate driving behavior (hard braking, idling) with maintenance needs', endpoint: '/cf-driver-behavior-analytics' },
  { kind: 'cfs', slug: 'cf-warranty-management', label: 'Warranty management', desc: 'Track warranty claims, identify recurring failures, push back to manufacturer', endpoint: '/cf-warranty-management' },
  { kind: 'cfs', slug: 'cf-parts-availability', label: 'Parts availability', desc: 'Track inventory, auto-order when low, recommend compatible alternatives', endpoint: '/cf-parts-availability' },
  { kind: 'cfs', slug: 'cf-technician-utilization', label: 'Technician utilization', desc: 'Analyze skill levels, assign complex jobs to specialists', endpoint: '/cf-technician-utilization' },
  { kind: 'gap-ai', slug: 'gap-ai-ai-surface-is-thin-12-endpoints-for-the-scope-missing-de', label: 'AI surface is thin (12 endpoints) for the scope — missing de', desc: 'AI surface is thin (12 endpoints) for the scope — missing dedicated predictive-failure, schedule-interval optimiser, parts-need predictor, technician-job matcher, warranty-claim assistant as full agen', endpoint: '/gap-ai-surface-is-thin-12-endpoints-for-the-scope-missing-de' },
  { kind: 'gap-ai', slug: 'gap-ai-no-driver-behaviour-to-maintenance-correlation-agent', label: 'No driver-behaviour-to-maintenance correlation agent', desc: 'No driver-behaviour-to-maintenance correlation agent', endpoint: '/gap-no-driver-behaviour-to-maintenance-correlation-agent' },
  { kind: 'gap-non', slug: 'gap-non-no-telematics-dtc-ingest-endpoint', label: 'No telematics / DTC ingest endpoint', desc: 'No telematics / DTC ingest endpoint', endpoint: '/gap-no-telematics-dtc-ingest-endpoint' },
  { kind: 'gap-non', slug: 'gap-non-no-technician-mobile-app-endpoint-surface', label: 'No technician mobile-app endpoint surface', desc: 'No technician mobile-app endpoint surface', endpoint: '/gap-no-technician-mobile-app-endpoint-surface' },
  { kind: 'gap-non', slug: 'gap-non-no-real-time-vehicle-gps-streaming', label: 'No real-time vehicle GPS streaming', desc: 'No real-time vehicle GPS streaming', endpoint: '/gap-no-real-time-vehicle-gps-streaming' },
  { kind: 'gap-non', slug: 'gap-non-limited-parts-supplier-price-availability-integration', label: 'Limited parts-supplier price/availability integration', desc: 'Limited parts-supplier price/availability integration', endpoint: '/gap-limited-parts-supplier-price-availability-integration' },
  { kind: 'gap-non', slug: 'gap-non-no-third-party-repair-shop-marketplace', label: 'No third-party repair-shop marketplace', desc: 'No third-party repair-shop marketplace', endpoint: '/gap-no-third-party-repair-shop-marketplace' },
  { kind: 'gap-non', slug: 'gap-non-no-webhooks', label: 'No webhooks', desc: 'No webhooks', endpoint: '/gap-no-webhooks' },
  { kind: 'gap-non', slug: 'gap-non-no-file-upload-module-surfaced', label: 'No file-upload module surfaced', desc: 'No file-upload module surfaced', endpoint: '/gap-no-file-upload-module-surfaced' },
];

function authHeaders() {
  const t = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

export default function Batch03Features() {
  const [active, setActive] = useState(FEATURES[0]?.slug);
  const [input, setInput] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleRequests = [
      {
          "label": "Scenario",
          "value": "Run Batch03 Features for a realistic customer case.\nContext: a team needs a practical recommendation based on incomplete operating data.\nGoal: identify the best action, key risks, missing information, and expected business impact.\nReturn: summary, prioritized action plan, assumptions, and follow-up questions."
      },
      {
          "label": "Data sample",
          "value": "Analyze this Batch03 Features data sample.\nInput records:\n- Record 1: urgent, customer impact high, owner unassigned\n- Record 2: medium priority, blocked by missing data\n- Record 3: recurring issue, automation opportunity\nReturn structured findings, anomalies, recommendations, and confidence."
      },
      {
          "label": "Executive review",
          "value": "Prepare an executive review for Batch03 Features.\nAudience: business owner, operations lead, and implementation team.\nInclude impact, risk, estimated effort, decision points, and a concise next-step plan."
      }
  ];

  const applySampleRequest = (value) => {
    setInput(value);
    setError(null);
  };
  const current = FEATURES.find(f => f.slug === active) || FEATURES[0];

  async function run() {
    if (!current) return;
    setLoading(true); setError(null);
    try {
      let parsed;
      try { parsed = input ? JSON.parse(input) : {}; } catch { parsed = { input }; }
      const r = await fetch(`${API_BASE}${current.endpoint}`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(parsed)
      });
      let body; try { body = await r.json(); } catch { body = { raw: await r.text() }; }
      if (!r.ok) setError(body.error || `HTTP ${r.status}`);
      setResults(prev => ({ ...prev, [current.slug]: body }));
    } catch (e) {
      setError(String(e.message || e));
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Batch 03 Features <small style={{ color: '#64748b', fontWeight: 400 }}>(AIFleetMaintenanceScheduler)</small></h2>
      <p style={{ color: '#475569', maxWidth: 720 }}>
        Audit-driven AI counterparts, non-AI feature gaps, and custom feature suggestions.
        Backend endpoints prefixed <code>/api/cf-*</code> (custom features) and <code>/api/gap-*</code> (gap fills).
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
        {FEATURES.map(f => (
          <button key={f.slug} onClick={() => setActive(f.slug)}
            style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #cbd5e1',
                     background: active === f.slug ? '#1e40af' : '#f8fafc',
                     color: active === f.slug ? 'white' : '#0f172a', cursor: 'pointer', fontSize: 12 }}>
            <span style={{ opacity: 0.7, marginRight: 4 }}>[{f.kind}]</span>{f.label}
          </button>
        ))}
      </div>
      {current && (
        <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: 8 }}>
            <strong>{current.label}</strong>
            <div style={{ color: '#475569', fontSize: 13 }}>{current.desc}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>POST <code>{current.endpoint}</code></div>
          </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {sampleRequests.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => applySampleRequest(sample.value)}
              style={{ padding: '6px 10px', background: '#eef2ff', color: '#1e3a8a', border: '1px solid #c7d2fe', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              {sample.label}
            </button>
          ))}
        </div>

          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder='Optional JSON input (e.g. {"query":"..."})'
            style={{ width: '100%', minHeight: 80, padding: 8, fontFamily: 'monospace', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={run} disabled={loading}
              style={{ padding: '8px 16px', background: '#1e40af', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Running…' : 'Run'}
            </button>
          </div>
          {error && (<div style={{ marginTop: 12, padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 4, fontSize: 13 }}>{error}</div>)}
          {results[current.slug] && (
            <pre style={{ marginTop: 12, padding: 10, background: '#0b1020', color: '#cbd5e1', borderRadius: 4, overflow: 'auto', maxHeight: 360, fontSize: 12 }}>
              {typeof results[current.slug] === 'string' ? results[current.slug] : JSON.stringify(results[current.slug], null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
