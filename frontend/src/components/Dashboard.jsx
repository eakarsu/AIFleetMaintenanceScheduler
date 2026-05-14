import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import * as api from '../services/api';

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [costTrend, setCostTrend] = useState([]);
  const [costByCat, setCostByCat] = useState([]);
  const [fuelTrend, setFuelTrend] = useState([]);
  const [maintenanceSummary, setMaintenanceSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, costData, fuelData, maintData] = await Promise.all([
        api.getDashboardStats().catch(() => ({})),
        api.getReportCosts().catch(() => null),
        api.getReportFuel().catch(() => null),
        api.getReportMaintenance().catch(() => null),
      ]);
      setStats(s);
      if (costData) {
        setCostTrend((costData.monthly || []).map(m => ({ month: m.month, total: Number(m.total) })));
        setCostByCat((costData.by_category || []).map(c => ({ category: c.category, value: Number(c.total) })));
      }
      if (fuelData) {
        setFuelTrend((fuelData.monthly || []).map(m => ({ month: m.month, gallons: Number(m.total_gallons), mpg: Number(m.avg_mpg || 0) })));
      }
      if (maintData) setMaintenanceSummary(maintData.summary);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const s = stats || {};
  const cards = [
    { label: 'Total Vehicles', value: s.total_vehicles ?? s.totalVehicles ?? 0, icon: '🚛', color: 'blue', path: '/vehicles' },
    { label: 'Active Vehicles', value: s.active_vehicles ?? s.activeVehicles ?? 0, icon: '✅', color: 'green', path: '/vehicles' },
    { label: 'In Maintenance', value: s.in_maintenance ?? s.inMaintenance ?? 0, icon: '🔧', color: 'yellow', path: '/maintenance' },
    { label: 'Total Drivers', value: s.total_drivers ?? s.totalDrivers ?? 0, icon: '👤', color: 'purple', path: '/drivers' },
    { label: 'Open Work Orders', value: s.open_work_orders ?? s.openWorkOrders ?? 0, icon: '📝', color: 'blue', path: '/workorders' },
    { label: 'Critical Alerts', value: s.critical_alerts ?? s.criticalAlerts ?? 0, icon: '🚨', color: 'red', path: '/alerts' },
    { label: 'Monthly Costs', value: `$${Number(s.monthly_costs ?? s.monthlyCosts ?? 0).toLocaleString()}`, icon: '💰', color: 'green', path: '/costs' },
    { label: 'Compliance Issues', value: s.compliance_issues ?? s.complianceIssues ?? 0, icon: '📋', color: 'red', path: '/compliance' },
    { label: 'Low Stock Parts', value: s.low_stock_parts ?? s.lowStockParts ?? 0, icon: '⚙️', color: 'yellow', path: '/parts' },
  ];

  const tooltipStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#f1f5f9'
  };

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">📊</span>Dashboard</h1>
      </div>
      <div className="dashboard-grid">
        {cards.map((card, i) => (
          <div key={i} className={`stat-card ${card.color}`} onClick={() => navigate(card.path)}>
            <div className="stat-card-header">
              <span className="stat-card-label">{card.label}</span>
              <span className="stat-card-icon">{card.icon}</span>
            </div>
            <div className="stat-card-value">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '16px', marginTop: '24px' }}>
        {costTrend.length > 0 && (
          <div className="ai-card">
            <div className="ai-card-header"><h3>💰 Monthly Cost Trend</h3></div>
            <div className="ai-card-body">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={costTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => `$${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {costByCat.length > 0 && (
          <div className="ai-card">
            <div className="ai-card-header"><h3>📊 Cost by Category</h3></div>
            <div className="ai-card-body">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={costByCat}
                    dataKey="value"
                    nameKey="category"
                    cx="50%" cy="50%" outerRadius={80}
                    label={(e) => `${e.category}: $${(e.value / 1000).toFixed(0)}K`}
                  >
                    {costByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={v => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {fuelTrend.length > 0 && (
          <div className="ai-card">
            <div className="ai-card-header"><h3>⛽ Fuel Consumption & Avg MPG</h3></div>
            <div className="ai-card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={fuelTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                  <Bar yAxisId="left" dataKey="gallons" fill="#22c55e" name="Gallons" />
                  <Bar yAxisId="right" dataKey="mpg" fill="#f59e0b" name="Avg MPG" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {maintenanceSummary && (
          <div className="ai-card">
            <div className="ai-card-header"><h3>🔧 Maintenance Status</h3></div>
            <div className="ai-card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { status: 'Completed', count: maintenanceSummary.completed || 0 },
                  { status: 'In Progress', count: maintenanceSummary.in_progress || 0 },
                  { status: 'Scheduled', count: (maintenanceSummary.total_records || 0) - (maintenanceSummary.completed || 0) - (maintenanceSummary.in_progress || 0) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
