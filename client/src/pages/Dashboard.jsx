import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  HiVideoCamera, 
  HiUsers, 
  HiEye, 
  HiThumbUp, 
  HiTrash, 
  HiEyeOff 
} from 'react-icons/hi';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: Track which video is currently being processed to disable buttons
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([API.get('/dashboard/stats'), API.get('/dashboard/videos')])
      .then(([statsRes, videosRes]) => { 
        setStats(statsRes.data.data); 
        setVideos(videosRes.data.data || []); 
      })
      .catch((err) => {
        toast.error('Failed to load dashboard data');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const togglePublish = async (id) => {
    // 1. Find the current status
    const videoToUpdate = videos.find(v => v._id === id);
    const currentStatus = videoToUpdate.isPublish;

    // 2. OPTIMISTIC UI UPDATE: Instantly change the UI before the API finishes
    setVideos(videos.map(v => 
      v._id === id ? { ...v, isPublish: !currentStatus } : v
    ));

    try {
      // 3. Make the API call in the background
      await API.patch(`/videos/toggle/publish/${id}`);
      toast.success(!currentStatus ? 'Video Published' : 'Video Unpublished');
    } catch (err) {
      // 4. If the API fails, revert the UI back to its original state
      setVideos(videos.map(v => 
        v._id === id ? { ...v, isPublish: currentStatus } : v
      ));
      toast.error('Failed to update status');
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm('Delete this video permanently? This action cannot be undone.')) return;
    
    setProcessingId(id); // Disable buttons for this specific video

    try {
      await API.delete(`/videos/${id}`);
      setVideos(videos.filter(v => v._id !== id));
      
      // SAFE STATE UPDATE: Check if stats exists before updating to prevent crashes
      setStats(prevStats => prevStats 
        ? { ...prevStats, totalVideos: Math.max(0, prevStats.totalVideos - 1) } 
        : prevStats
      );
      
      toast.success('Video deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete video');
    } finally {
      setProcessingId(null); // Re-enable buttons
    }
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
          {videos.map((video) => (
            <div key={video._id} className="card" style={{ padding: 16, animation: 'fadeInUp 0.4s ease both' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {video.thumbnail && (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    style={{ width: 140, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} 
                    onClick={() => navigate(`/video/${video._id}`)} 
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6, cursor: 'pointer' }} onClick={() => navigate(`/video/${video._id}`)}>
                    {video.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>{video.views || 0} views</span>
                    <span style={{ color: video.isPublish ? 'var(--success)' : 'var(--warning)' }}>
                      {video.isPublish ? '● Published' : '● Private'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => togglePublish(video._id)} 
                    disabled={processingId === video._id}
                    title={video.isPublish ? 'Make Private' : 'Publish'}
                  >
                    {video.isPublish ? <><HiEyeOff style={{marginRight: 4}}/> Hide</> : <><HiEye style={{marginRight: 4}}/> Show</>}
                  </button>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => deleteVideo(video._id)} 
                    disabled={processingId === video._id}
                    style={{ 
                      background: processingId === video._id ? 'var(--bg-hover)' : 'rgba(248,113,113,0.1)', 
                      color: processingId === video._id ? 'var(--text-muted)' : 'var(--danger)',
                      cursor: processingId === video._id ? 'not-allowed' : 'pointer'
                    }}
                  >
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
