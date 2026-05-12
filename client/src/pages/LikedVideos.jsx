import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';

export default function LikedVideos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    API.get('/likes/videos')
      .then(({ data }) => setVideos(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="empty-state"><h3>Please sign in to see liked videos</h3></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Liked Videos</h1>
        <p>{videos.length} videos you've liked</p>
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>No liked videos</h3>
          <p>Videos you like will appear here</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
