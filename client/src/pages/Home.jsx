import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import VideoCard from '../components/VideoCard';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  useEffect(() => {
    setLoading(true);
    API.get('/videos', { params: { query, page: 1, limit: 20, sortBy: 'createdAt', sortType: 'desc' } })
      .then(({ data }) => setVideos(data.data?.docs || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div>
      <div className="page-header">
        <h1>{query ? `Results for "${query}"` : 'Discover Videos'}</h1>
        <p>{query ? `Showing results matching your search` : 'Trending and latest uploads from creators'}</p>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No videos found</h3>
          <p>{query ? 'Try a different search term' : 'Be the first to upload a video!'}</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
