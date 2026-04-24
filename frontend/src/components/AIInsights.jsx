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

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => { try { const d = await api.getVehicles(); setVehicles(Array.isArray(d) ? d : d.vehicles || d.data || []); } catch (e) {} };
  const fetchDrivers = async () => { try { const d = await api.getDrivers(); setDrivers(Array.isArray(d) ? d : d.drivers || d.data || []); } catch (e) {} };

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
          <AIResponse data={predictData} loading={predictLoading} error={predictError} />
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
          <AIResponse data={complianceData} loading={complianceLoading} error={complianceError} />
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
      </div>
    </div>
  );
}
