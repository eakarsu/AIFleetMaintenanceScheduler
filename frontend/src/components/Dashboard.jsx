import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
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
    </div>
  );
}
