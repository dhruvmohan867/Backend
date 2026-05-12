import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Subscriptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    API.get(`/subscriptions/u/${user._id}`)
      .then(({ data }) => setChannels(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="empty-state"><h3>Please sign in to see subscriptions</h3></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Subscriptions</h1>
        <p>Channels you follow</p>
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : channels.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📺</div>
          <h3>No subscriptions</h3>
          <p>Subscribe to channels to see them here</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          {channels.map(ch => (
            <div key={ch._id} className="card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate(`/channel/${ch.channel?.username || ch.username}`)}>
              <img src={ch.channel?.avatar || ch.avatar} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '2px solid var(--border-glow)' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ch.channel?.fullname || ch.fullname}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>@{ch.channel?.username || ch.username}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
