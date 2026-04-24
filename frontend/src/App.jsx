import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';
import Maintenance from './components/Maintenance';
import Compliance from './components/Compliance';
import Parts from './components/Parts';
import WorkOrders from './components/WorkOrders';
import Drivers from './components/Drivers';
import Assignments from './components/Assignments';
import Fuel from './components/Fuel';
import Downtime from './components/Downtime';
import Scheduling from './components/Scheduling';
import Costs from './components/Costs';
import Alerts from './components/Alerts';
import AIInsights from './components/AIInsights';
import Tires from './components/Tires';
import Inspections from './components/Inspections';
import Warranties from './components/Warranties';
import Vendors from './components/Vendors';
import Incidents from './components/Incidents';
import TripLogs from './components/TripLogs';
import Reports from './components/Reports';
import ServiceReminders from './components/ServiceReminders';
import FleetOverview from './components/FleetOverview';
import Profile from './components/Profile';
import ActivityLog from './components/ActivityLog';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/vehicles', label: 'Vehicles', icon: '🚛' },
    { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
    { path: '/compliance', label: 'Compliance', icon: '📋' },
    { path: '/parts', label: 'Parts', icon: '⚙️' },
    { path: '/workorders', label: 'Work Orders', icon: '📝' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
    { path: '/assignments', label: 'Assignments', icon: '🔗' },
    { path: '/fuel', label: 'Fuel', icon: '⛽' },
    { path: '/downtime', label: 'Downtime', icon: '⏸️' },
    { path: '/scheduling', label: 'Scheduling', icon: '📅' },
    { path: '/costs', label: 'Costs', icon: '💰' },
    { path: '/alerts', label: 'Alerts', icon: '🔔' },
    { path: '/tires', label: 'Tires', icon: '🛞' },
    { path: '/inspections', label: 'Inspections', icon: '✅' },
    { path: '/warranties', label: 'Warranties', icon: '🛡️' },
    { path: '/vendors', label: 'Vendors', icon: '🏢' },
    { path: '/incidents', label: 'Incidents', icon: '⚠️' },
    { path: '/trips', label: 'Trip Logs', icon: '🗺️' },
    { path: '/fleet-overview', label: 'Fleet Overview', icon: '🏁' },
    { path: '/reports', label: 'Reports', icon: '📊' },
    { path: '/reminders', label: 'Reminders', icon: '🔔' },
    { path: '/activity-log', label: 'Activity Log', icon: '📜' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/ai-insights', label: 'AI Insights', icon: '🤖' },
  ];

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {token && (
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">🚛</span>
              {!sidebarCollapsed && <span className="logo-text">FleetGuard AI</span>}
            </div>
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '▶' : '◀'}
            </button>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            {!sidebarCollapsed && (
              <div className="user-info">
                <div className="user-avatar">{(user.name || 'U')[0]}</div>
                <div className="user-details">
                  <div className="user-name">{user.name || 'User'}</div>
                  <div className="user-role">{user.role || 'admin'}</div>
                </div>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              {sidebarCollapsed ? '🚪' : '🚪 Logout'}
            </button>
          </div>
        </aside>
      )}
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
          <Route path="/parts" element={<ProtectedRoute><Parts /></ProtectedRoute>} />
          <Route path="/workorders" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />
          <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/fuel" element={<ProtectedRoute><Fuel /></ProtectedRoute>} />
          <Route path="/downtime" element={<ProtectedRoute><Downtime /></ProtectedRoute>} />
          <Route path="/scheduling" element={<ProtectedRoute><Scheduling /></ProtectedRoute>} />
          <Route path="/costs" element={<ProtectedRoute><Costs /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/tires" element={<ProtectedRoute><Tires /></ProtectedRoute>} />
          <Route path="/inspections" element={<ProtectedRoute><Inspections /></ProtectedRoute>} />
          <Route path="/warranties" element={<ProtectedRoute><Warranties /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><TripLogs /></ProtectedRoute>} />
          <Route path="/fleet-overview" element={<ProtectedRoute><FleetOverview /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><ServiceReminders /></ProtectedRoute>} />
          <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/ai-insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
