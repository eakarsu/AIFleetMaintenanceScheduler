import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import * as api from '../services/api';

function AISection({ title, icon, children }) {
  return (
    <div className="ai-card">
      <div className="ai-card-header">
        <h3><span>{icon}</span> {title}</h3>
      </div>
      <div className="ai-card-body">
        {children}
      </div>
    </div>
  );
}

function AIResponse({ data, loading, error }) {
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

  // Extract markdown content from various response shapes
  let content = '';
  if (typeof data === 'string') {
    content = data;
  } else if (data.analysis) {
    content = typeof data.analysis === 'string' ? data.analysis : JSON.stringify(data.analysis, null, 2);
  } else if (data.result) {
    content = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
  } else if (data.report) {
    content = typeof data.report === 'string' ? data.report : JSON.stringify(data.report, null, 2);
  } else if (data.recommendations) {
    content = typeof data.recommendations === 'string' ? data.recommendations : JSON.stringify(data.recommendations, null, 2);
  } else if (data.response) {
    content = typeof data.response === 'string' ? data.response : JSON.stringify(data.response, null, 2);
  } else if (data.data) {
    content = typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2);
  } else if (data.message) {
    content = data.message;
  } else {
    content = JSON.stringify(data, null, 2);
  }

  // If content looks like JSON, try to format it nicely as markdown
  if (content.startsWith('{') || content.startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      content = jsonToMarkdown(parsed);
    } catch (e) {
      // keep as-is
    }
  }

  return (
    <div className="ai-response">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

function jsonToMarkdown(obj, depth = 0) {
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') return `- ${item}`;
      if (typeof item === 'object') return jsonToMarkdown(item, depth + 1);
      return `- ${item}`;
    }).join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).map(([key, value]) => {
      const heading = '#'.repeat(Math.min(depth + 2, 4));
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return `**${label}:** ${value}`;
      }
      return `${heading} ${label}\n\n${jsonToMarkdown(value, depth + 1)}`;
    }).join('\n\n');
  }
  return String(obj);
}

// Structured display for predictive maintenance JSON response
function PredictiveMaintenanceDisplay({ data }) {
  if (!data || !data.analysis) return null;

  // Try to parse JSON from analysis text
  let parsed = null;
  try {
    const stripped = data.analysis.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  } catch (e) {}

  if (parsed && (parsed.predicted_failures || parsed.recommended_actions || parsed.risk_level || parsed.ninety_day_risk)) {
    const riskColor = { high: 'var(--accent-red)', medium: '#f59e0b', low: 'var(--accent-green)' };
    const risk = (parsed.risk_level || parsed.ninety_day_risk || '').toLowerCase();
    return (
      <div style={{ padding: '12px 0' }}>
        {parsed.risk_level || parsed.ninety_day_risk ? (
          <div style={{ marginBottom: '12px', padding: '10px 14px', background: `${riskColor[risk] || '#888'}20`, borderLeft: `4px solid ${riskColor[risk] || '#888'}`, borderRadius: '4px' }}>
            <strong>90-Day Risk Level: </strong>
            <span style={{ color: riskColor[risk] || '#888', fontWeight: 700, textTransform: 'uppercase' }}>{risk}</span>
          </div>
        ) : null}
        {parsed.predicted_failures && Array.isArray(parsed.predicted_failures) && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ display: 'block', marginBottom: '6px' }}>Predicted Failures</strong>
            {parsed.predicted_failures.map((f, i) => (
              <div key={i} style={{ padding: '6px 10px', marginBottom: '4px', background: 'var(--surface-raised, #f3f4f6)', borderRadius: '4px', fontSize: '0.875rem' }}>
                {typeof f === 'string' ? f : JSON.stringify(f)}
              </div>
            ))}
          </div>
        )}
        {parsed.recommended_actions && Array.isArray(parsed.recommended_actions) && (
          <div>
            <strong style={{ display: 'block', marginBottom: '6px' }}>Recommended Actions</strong>
            {parsed.recommended_actions.map((a, i) => (
              <div key={i} style={{ padding: '6px 10px', marginBottom: '4px', background: '#dcfce720', border: '1px solid #16a34a40', borderRadius: '4px', fontSize: '0.875rem' }}>
                {typeof a === 'string' ? a : JSON.stringify(a)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fall back to markdown display
  return <AIResponse data={data} loading={false} error="" />;
}

// Structured compliance risk display
function ComplianceDisplay({ data }) {
  if (!data || !data.analysis) return null;

  // Try to extract risk score from analysis text
  const scoreMatch = data.analysis.match(/risk score[:\s]*(\d+)[/\s]*10/i) || data.analysis.match(/(\d+)\s*\/\s*10/);
  const fineMatch = data.analysis.match(/\$[\d,]+(?:\s*(?:to|-)\s*\$[\d,]+)?/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  return (
    <div style={{ padding: '12px 0' }}>
      {score !== null && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <strong>Compliance Risk Score:</strong>
            <span style={{
              fontSize: '1.5rem', fontWeight: 700,
              color: score >= 7 ? 'var(--accent-red)' : score >= 4 ? '#f59e0b' : 'var(--accent-green)'
            }}>{score}/10</span>
            <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
              background: score >= 7 ? '#fee2e2' : score >= 4 ? '#fef3c7' : '#dcfce7',
              color: score >= 7 ? '#dc2626' : score >= 4 ? '#d97706' : '#16a34a'
            }}>{score >= 7 ? 'HIGH RISK' : score >= 4 ? 'MEDIUM RISK' : 'LOW RISK'}</span>
          </div>
          <div style={{ height: '8px', background: 'var(--surface-raised, #e5e7eb)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${score * 10}%`, background: score >= 7 ? 'var(--accent-red)' : score >= 4 ? '#f59e0b' : 'var(--accent-green)', borderRadius: '999px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {fineMatch && (
        <div style={{ marginBottom: '12px', padding: '8px 14px', background: '#fff7ed', border: '1px solid #fdba7480', borderRadius: '6px', fontSize: '0.875rem' }}>
          <strong>Estimated Fine Exposure: </strong><span style={{ color: '#c2410c', fontWeight: 600 }}>{fineMatch[0]}</span>
        </div>
      )}
      <AIResponse data={data} loading={false} error="" />
    </div>
  );
}

// Fleet Replacement Scorer display
function FleetReplacementDisplay({ data, loading, error }) {
  if (loading) return <div className="ai-loading"><div className="spinner"></div><span className="ai-loading-text">Scoring replacement priority...</span></div>;
  if (error) return <div className="ai-response"><p style={{ color: 'var(--accent-red)' }}>{error}</p></div>;
  if (!data) return null;

  // Try to extract replacement score from analysis
  const scoreMatch = data.analysis && (
    data.analysis.match(/replacement(?:\s+priority)?\s+score[:\s]*(\d+)/i) ||
    data.analysis.match(/score[:\s]*(\d+)\s*\/\s*100/i) ||
    data.analysis.match(/\b(\d{1,2}|100)\b/)
  );
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  const retireMatch = data.analysis && data.analysis.match(/retire[:\s]+([^\n.]+)/i);
  const lifeMatch = data.analysis && data.analysis.match(/(?:estimated\s+)?remaining\s+life[:\s]+([^\n.]+)/i);
  const savingsMatch = data.analysis && data.analysis.match(/(?:cost\s+savings|savings)[:\s]+([^\n.]+)/i);

  const gaugeColor = score !== null ? (score < 30 ? '#16a34a' : score < 70 ? '#d97706' : '#dc2626') : '#6b7280';

  return (
    <div style={{ padding: '12px 0' }}>
      {score !== null && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <strong>Replacement Priority Score:</strong>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: gaugeColor }}>{score}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/100</span>
          </div>
          <div style={{ height: '10px', background: 'linear-gradient(to right, #16a34a, #d97706, #dc2626)', borderRadius: '999px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '50%', left: `${score}%`, transform: 'translate(-50%, -50%)',
              width: '16px', height: '16px', background: '#1e293b', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 4px rgba(0,0,0,0.4)'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            <span>Keep (Low)</span><span>Monitor (Medium)</span><span>Replace (High)</span>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {retireMatch && (
          <div style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
            background: retireMatch[1].toLowerCase().includes('retire') ? '#fee2e2' : '#dcfce7',
            color: retireMatch[1].toLowerCase().includes('retire') ? '#dc2626' : '#16a34a'
          }}>
            {retireMatch[1].trim()}
          </div>
        )}
        {lifeMatch && (
          <div style={{ padding: '6px 14px', background: '#f0f9ff', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: '#0369a1' }}>
            Remaining Life: {lifeMatch[1].trim()}
          </div>
        )}
        {savingsMatch && (
          <div style={{ padding: '6px 14px', background: '#f0fdf4', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>
            Potential Savings: {savingsMatch[1].trim()}
          </div>
        )}
      </div>
      <AIResponse data={data} loading={false} error="" />
    </div>
  );
}

export default function AIInsights() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // State for each AI section
  const [predictVehicle, setPredictVehicle] = useState('');
  const [predictData, setPredictData] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState('');

  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  const [routeForm, setRouteForm] = useState({ vehicle_id: '', origin: '', destination: '', cargo_type: '' });
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');

  const [complianceVehicle, setComplianceVehicle] = useState('');
  const [complianceData, setComplianceData] = useState(null);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceError, setComplianceError] = useState('');

  const [costData, setCostData] = useState(null);
  const [costLoading, setCostLoading] = useState(false);
  const [costError, setCostError] = useState('');

  const [driverSelect, setDriverSelect] = useState('');
  const [driverData, setDriverData] = useState(null);
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverError, setDriverError] = useState('');

  const [replacementVehicle, setReplacementVehicle] = useState('');
  const [replacementData, setReplacementData] = useState(null);
  const [replacementLoading, setReplacementLoading] = useState(false);
  const [replacementError, setReplacementError] = useState('');

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.data || d.vehicles || []); } catch (e) {} };
  const fetchDrivers = async () => { try { const d = await api.getDrivers(); setDrivers(Array.isArray(d) ? d : d.data || d.drivers || []); } catch (e) {} };

  const handlePredict = async () => {
    if (!predictVehicle) return;
    setPredictLoading(true); setPredictError(''); setPredictData(null);
    try { const d = await api.predictMaintenance(predictVehicle); setPredictData(d); } catch (e) { setPredictError(e.message); }
    setPredictLoading(false);
  };

  const handleAnalytics = async () => {
    setAnalyticsLoading(true); setAnalyticsError(''); setAnalyticsData(null);
    try { const d = await api.getFleetAnalytics(); setAnalyticsData(d); } catch (e) { setAnalyticsError(e.message); }
    setAnalyticsLoading(false);
  };

  const handleRoute = async () => {
    setRouteLoading(true); setRouteError(''); setRouteData(null);
    try { const d = await api.optimizeRoute(routeForm); setRouteData(d); } catch (e) { setRouteError(e.message); }
    setRouteLoading(false);
  };

  const handleCompliance = async () => {
    if (!complianceVehicle) return;
    setComplianceLoading(true); setComplianceError(''); setComplianceData(null);
    try { const d = await api.checkCompliance(complianceVehicle); setComplianceData(d); } catch (e) { setComplianceError(e.message); }
    setComplianceLoading(false);
  };

  const handleCost = async () => {
    setCostLoading(true); setCostError(''); setCostData(null);
    try { const d = await api.analyzeCosts(); setCostData(d); } catch (e) { setCostError(e.message); }
    setCostLoading(false);
  };

  const handleDriver = async () => {
    if (!driverSelect) return;
    setDriverLoading(true); setDriverError(''); setDriverData(null);
    try { const d = await api.analyzeDriverPerformance(driverSelect); setDriverData(d); } catch (e) { setDriverError(e.message); }
    setDriverLoading(false);
  };

  const handleReplacement = async () => {
    if (!replacementVehicle) return;
    setReplacementLoading(true); setReplacementError(''); setReplacementData(null);
    try { const d = await api.scoreFleetReplacement(replacementVehicle); setReplacementData(d); } catch (e) { setReplacementError(e.message); }
    setReplacementLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">🤖</span>AI Insights</h1>
      </div>

      <div className="ai-grid">
        {/* Predictive Maintenance */}
        <AISection title="Predictive Maintenance" icon="🔮">
          <div className="ai-form">
            <div className="form-group">
              <label>Select Vehicle</label>
              <select value={predictVehicle} onChange={e => setPredictVehicle(e.target.value)}>
                <option value="">Choose a vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handlePredict} disabled={!predictVehicle || predictLoading}>
              Analyze
            </button>
          </div>
          {predictLoading && <div className="ai-loading"><div className="spinner"></div><span className="ai-loading-text">AI is analyzing...</span></div>}
          {predictError && <div className="ai-response"><p style={{ color: 'var(--accent-red)' }}>{predictError}</p></div>}
          {predictData && <PredictiveMaintenanceDisplay data={predictData} />}
        </AISection>

        {/* Fleet Analytics */}
        <AISection title="Fleet Analytics" icon="📊">
          <div className="ai-form">
            <button className="btn btn-primary" onClick={handleAnalytics} disabled={analyticsLoading}>
              Generate Report
            </button>
          </div>
          <AIResponse data={analyticsData} loading={analyticsLoading} error={analyticsError} />
        </AISection>

        {/* Route Optimization */}
        <AISection title="Route Optimization" icon="🗺️">
          <div className="ai-form">
            <div className="form-group">
              <label>Vehicle</label>
              <select value={routeForm.vehicle_id} onChange={e => setRouteForm(p => ({ ...p, vehicle_id: e.target.value }))}>
                <option value="">Select...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Origin</label>
              <input value={routeForm.origin} onChange={e => setRouteForm(p => ({ ...p, origin: e.target.value }))} placeholder="Starting point" />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input value={routeForm.destination} onChange={e => setRouteForm(p => ({ ...p, destination: e.target.value }))} placeholder="End point" />
            </div>
            <div className="form-group">
              <label>Cargo Type</label>
              <input value={routeForm.cargo_type} onChange={e => setRouteForm(p => ({ ...p, cargo_type: e.target.value }))} placeholder="e.g. refrigerated" />
            </div>
            <button className="btn btn-primary" onClick={handleRoute} disabled={routeLoading}>
              Optimize
            </button>
          </div>
          <AIResponse data={routeData} loading={routeLoading} error={routeError} />
        </AISection>

        {/* Compliance Check */}
        <AISection title="Compliance Check" icon="📋">
          <div className="ai-form">
            <div className="form-group">
              <label>Select Vehicle</label>
              <select value={complianceVehicle} onChange={e => setComplianceVehicle(e.target.value)}>
                <option value="">Choose a vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleCompliance} disabled={!complianceVehicle || complianceLoading}>
              Check Compliance
            </button>
          </div>
          {complianceLoading && <div className="ai-loading"><div className="spinner"></div><span className="ai-loading-text">AI is analyzing...</span></div>}
          {complianceError && <div className="ai-response"><p style={{ color: 'var(--accent-red)' }}>{complianceError}</p></div>}
          {complianceData && <ComplianceDisplay data={complianceData} />}
        </AISection>

        {/* Cost Analysis */}
        <AISection title="Cost Analysis" icon="💰">
          <div className="ai-form">
            <button className="btn btn-primary" onClick={handleCost} disabled={costLoading}>
              Analyze Costs
            </button>
          </div>
          <AIResponse data={costData} loading={costLoading} error={costError} />
        </AISection>

        {/* Driver Performance */}
        <AISection title="Driver Performance" icon="👤">
          <div className="ai-form">
            <div className="form-group">
              <label>Select Driver</label>
              <select value={driverSelect} onChange={e => setDriverSelect(e.target.value)}>
                <option value="">Choose a driver...</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.employee_id})</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleDriver} disabled={!driverSelect || driverLoading}>
              Analyze
            </button>
          </div>
          <AIResponse data={driverData} loading={driverLoading} error={driverError} />
        </AISection>

        {/* Fleet Replacement Scorer */}
        <AISection title="Fleet Replacement Scorer" icon="🔄">
          <div className="ai-form">
            <div className="form-group">
              <label>Select Vehicle</label>
              <select value={replacementVehicle} onChange={e => setReplacementVehicle(e.target.value)}>
                <option value="">Choose a vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model} ({v.year})</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleReplacement} disabled={!replacementVehicle || replacementLoading}>
              Score Replacement Priority
            </button>
          </div>
          <FleetReplacementDisplay data={replacementData} loading={replacementLoading} error={replacementError} />
        </AISection>
      </div>
    </div>
  );
}
