import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { HiSearch, HiPlus } from 'react-icons/hi';

export default function Header() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">▶ Breve</Link>

      <form className="header-search" onSubmit={handleSearch}>
        <input
          type="text" placeholder="Search videos..."
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit"><HiSearch /></button>
      </form>

      <div className="header-actions">
        {user ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>
              <HiPlus /> Upload
            </button>
            <div style={{ position: 'relative' }}>
              <button className="avatar-btn" onClick={() => setShowMenu(!showMenu)}>
                {user.avatar ? <img src={user.avatar} alt="" /> : user.fullname?.[0]?.toUpperCase()}
              </button>
              {showMenu && (
                <div style={{
                  position: 'absolute', top: '48px', right: 0, width: '200px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '8px', zIndex: 200,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.fullname}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{user.username}</div>
                  </div>
                  <button className="sidebar-item" style={{ width: '100%', borderRadius: '8px' }} onClick={() => { navigate(`/channel/${user.username}`); setShowMenu(false); }}>My Channel</button>
                  <button className="sidebar-item" style={{ width: '100%', borderRadius: '8px' }} onClick={() => { navigate('/dashboard'); setShowMenu(false); }}>Dashboard</button>
                  <button className="sidebar-item" style={{ width: '100%', borderRadius: '8px', color: 'var(--danger)' }} onClick={() => { logout(); setShowMenu(false); navigate('/'); }}>Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
        )}
      </div>
    </header>
  );
}
