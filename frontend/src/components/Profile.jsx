import { useState, useEffect } from 'react';
import { getProfile, updateProfile, changePassword } from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({ name: data.name, email: data.email });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      localStorage.setItem('user', JSON.stringify({ name: updated.name, role: updated.role }));
      setEditing(false);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      await changePassword(passwordForm.current_password, passwordForm.new_password);
      setChangingPassword(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      showToast('Password changed successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSaving(false);
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading profile...</p></div>;
  if (!profile) return <div className="empty-state"><span className="empty-state-icon">👤</span><p>Failed to load profile</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1><span className="header-icon">👤</span> Profile & Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
            borderBottom: '1px solid var(--border-color)', textAlign: 'center'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, margin: '0 auto 12px',
              color: 'white'
            }}>
              {profile.name[0].toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{profile.name}</h2>
            <span className={`badge badge-${profile.role === 'admin' ? 'active' : 'info'}`}>{profile.role}</span>
          </div>

          <div style={{ padding: '24px' }}>
            {!editing ? (
              <div>
                <div className="detail-grid">
                  <div className="detail-field">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{profile.name}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profile.email}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{profile.role}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">{new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                  <button className="btn btn-secondary" onClick={() => setChangingPassword(!changingPassword)}>
                    {changingPassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ name: profile.name, email: profile.email }); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Card */}
        {changingPassword && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)', overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid var(--border-color)',
              background: 'rgba(59,130,246,0.04)'
            }}>
              <h3 style={{ fontSize: '1.05rem' }}>Change Password</h3>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={passwordForm.current_password}
                  onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwordForm.new_password}
                  onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={passwordForm.confirm_password}
                  onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} />
              </div>
              <button className="btn btn-primary" onClick={handleChangePassword} disabled={saving}>
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}

        {/* Quick Info Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid var(--border-color)',
            background: 'rgba(59,130,246,0.04)'
          }}>
            <h3 style={{ fontSize: '1.05rem' }}>System Info</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div className="detail-grid">
              <div className="detail-field">
                <span className="detail-label">Application</span>
                <span className="detail-value">FleetGuard AI</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Version</span>
                <span className="detail-value">1.0.0</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Timezone</span>
                <span className="detail-value">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Browser</span>
                <span className="detail-value">{navigator.userAgent.split(' ').pop().split('/')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
