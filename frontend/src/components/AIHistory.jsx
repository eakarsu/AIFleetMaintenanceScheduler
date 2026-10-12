import { Fragment, useState, useEffect } from 'react';
import * as api from '../services/api';
import NativeAIReport, { reportText, reportValue } from './NativeAIReport';

export default function AIHistory() {
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchResults(page); }, [page]);

  const fetchResults = async (p) => {
    setLoading(true);
    try {
      const data = await api.getAIResults(p);
      setResults(data.data || []);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const endpointLabel = (endpoint) => {
    const labels = {
      'predictive-maintenance': 'Predictive Maintenance',
      'fleet-analytics': 'Fleet Analytics',
      'route-optimization': 'Route Optimization',
      'compliance-check': 'Compliance Check',
      'cost-analysis': 'Cost Analysis',
      'driver-performance': 'Driver Performance',
      'fleet-replacement-score': 'Fleet Replacement Score',
    };
    return labels[endpoint] || endpoint;
  };

  const resultPreview = (result) => {
    const text = reportText(reportValue(result)).replace(/\s+/g, ' ').trim();
    return text ? `${text.slice(0, 100)}${text.length > 100 ? '…' : ''}` : '—';
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading AI history...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">📜</span>AI Results History</h1>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🤖</span>
          <p>No AI results yet. Run an analysis in AI Insights to see history here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Date</th>
                <th>Result Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <Fragment key={r.id}>
                  <tr>
                    <td><span className="badge badge-active">{endpointLabel(r.endpoint)}</span></td>
                    <td>{r.vehicle_code ? `${r.vehicle_code} – ${r.make} ${r.model}` : '—'}</td>
                    <td>{r.driver_name || '—'}</td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {resultPreview(r.result)}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      >
                        {expandedId === r.id ? 'Hide' : 'Expand'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr>
                      <td colSpan={6}>
                        <div className="ai-history" style={{ margin: '4px 0' }}>
                          {r.input_data && Object.keys(r.input_data).length > 0 && (
                            <details style={{ marginBottom: 16 }}>
                              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Request input</summary>
                              <NativeAIReport response={r.input_data} title="Request input" />
                            </details>
                          )}
                          <NativeAIReport response={r.result} title={endpointLabel(r.endpoint)} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
