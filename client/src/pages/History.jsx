import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';

export default function History() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    API.get('/users/history')
      .then(({ data }) => setVideos(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="empty-state"><h3>Please sign in to see watch history</h3></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Watch History</h1>
        <p>Videos you've watched recently</p>
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🕐</div>
          <h3>No watch history</h3>
          <p>Videos you watch will appear here</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
