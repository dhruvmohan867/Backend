import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiVideoCamera, HiUsers, HiEye, HiThumbUp, HiTrash, HiEyeOff } from 'react-icons/hi';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([API.get('/dashboard/stats'), API.get('/dashboard/videos')])
      .then(([s, v]) => { setStats(s.data.data); setVideos(v.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const togglePublish = async (id) => {
    try {
      const { data } = await API.patch(`/videos/toggle/publish/${id}`);
      setVideos(videos.map(v => v._id === id ? { ...v, isPublish: data.data.isPublish } : v));
      toast.success(data.data.isPublish ? 'Published' : 'Unpublished');
    } catch { toast.error('Failed'); }
  };

  const deleteVideo = async (id) => {
    if (!confirm('Delete this video permanently?')) return;
    try {
      await API.delete(`/videos/${id}`);
      setVideos(videos.filter(v => v._id !== id));
      setStats(s => ({ ...s, totalVideos: (s.totalVideos || 1) - 1 }));
      toast.success('Video deleted');
    } catch { toast.error('Failed'); }
  };

  if (!user) return <div className="empty-state"><h3>Please sign in</h3></div>;
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const statItems = [
    { icon: <HiVideoCamera />, value: stats?.totalVideos || 0, label: 'Total Videos', grad: 'var(--gradient-1)' },
    { icon: <HiUsers />, value: stats?.totalSubscribers || 0, label: 'Subscribers', grad: 'var(--gradient-2)' },
    { icon: <HiEye />, value: stats?.totalViews || 0, label: 'Total Views', grad: 'var(--gradient-3)' },
    { icon: <HiThumbUp />, value: stats?.totalLikes || 0, label: 'Total Likes', grad: 'var(--gradient-4)' },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white' }}>
                {s.icon}
              </div>
            </div>
            <div className="stat-value">{s.value.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>Your Videos</h2>
      {videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No videos yet</h3>
          <p>Upload your first video to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/upload')}>Upload Video</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {videos.map((v) => (
            <div key={v._id} className="card" style={{ padding: 16, animation: 'fadeInUp 0.4s ease both' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 140, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => navigate(`/video/${v._id}`)} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6, cursor: 'pointer' }} onClick={() => navigate(`/video/${v._id}`)}>{v.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>{v.views || 0} views</span>
                    <span style={{ color: v.isPublish ? 'var(--success)' : 'var(--danger)' }}>{v.isPublish ? '● Published' : '● Unpublished'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => togglePublish(v._id)} title={v.isPublish ? 'Unpublish' : 'Publish'}>
                    <HiEyeOff /> {v.isPublish ? 'Hide' : 'Show'}
                  </button>
                  <button className="btn btn-sm" onClick={() => deleteVideo(v._id)} style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)' }}>
                    <HiTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
