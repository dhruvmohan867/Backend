import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { HiVideoCamera, HiUsers, HiEye, HiThumbUp } from 'react-icons/hi';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      API.get('/dashboard/stats'),
      API.get('/dashboard/videos'),
    ])
      .then(([statsRes, videosRes]) => {
        setStats(statsRes.data.data);
        setVideos(videosRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="empty-state"><h3>Please sign in</h3></div>;
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const statItems = [
    { icon: <HiVideoCamera />, value: stats?.totalVideos || 0, label: 'Total Videos' },
    { icon: <HiUsers />, value: stats?.totalSubscribers || 0, label: 'Subscribers' },
    { icon: <HiEye />, value: stats?.totalViews || 0, label: 'Total Views' },
    { icon: <HiThumbUp />, value: stats?.totalLikes || 0, label: 'Total Likes' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your channel analytics at a glance</p>
      </div>

      <div className="stats-grid">
        {statItems.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--accent-light)', fontSize: '1.5rem' }}>
              {s.icon}
            </div>
            <div className="stat-value">{s.value.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Your Videos</h2>
      {videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No videos yet</h3>
          <p>Upload your first video to get started</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => (
            <div key={v._id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{v.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {v.views || 0} views • {v.isPublish ? '🟢 Published' : '🔴 Unpublished'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
