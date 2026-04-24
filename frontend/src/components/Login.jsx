import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || { name: email.split('@')[0], email, role: 'admin' }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleQuickLogin = () => {
    setEmail('admin@fleetops.com');
    setPassword('admin123');
    setTimeout(() => {
      document.getElementById('login-form').requestSubmit();
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🚛</span>
          <h1>FleetGuard AI</h1>
          <p>AI-Powered Fleet Maintenance Scheduler</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form id="login-form" className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@fleetops.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button type="button" className="btn btn-quick" onClick={handleQuickLogin}>
            Quick Login (Demo)
          </button>
        </form>
      </div>
    </div>
  );
}
