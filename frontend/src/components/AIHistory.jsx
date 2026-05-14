import { useState, useEffect } from 'react';
import * as api from '../services/api';

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
                <>
                  <tr key={r.id}>
                    <td><span className="badge badge-active">{endpointLabel(r.endpoint)}</span></td>
                    <td>{r.vehicle_code ? `${r.vehicle_code} – ${r.make} ${r.model}` : '—'}</td>
                    <td>{r.driver_name || '—'}</td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.result ? r.result.substring(0, 100) + '…' : '—'}
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
                    <tr key={`expanded-${r.id}`}>
                      <td colSpan={6}>
                        <div style={{ background: 'var(--surface-raised, #f8f9fa)', padding: '16px', borderRadius: '6px', margin: '4px 0', maxHeight: '400px', overflowY: 'auto' }}>
                          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            {r.input_data && Object.keys(r.input_data).length > 0 && (
                              <div>
                                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Input</strong>
                                <pre style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>{JSON.stringify(r.input_data, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                          <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Full Result</strong>
                          <pre style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', margin: '4px 0 0', lineHeight: 1.5 }}>{r.result}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
