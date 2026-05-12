import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import VideoCard from '../components/VideoCard';

function VideoSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton skeleton-card" />
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="skeleton skeleton-circle" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const fetchVideos = useCallback((pageNum, append = false) => {
    const setter = append ? setLoadingMore : setLoading;
    setter(true);
    API.get('/videos', { params: { query, page: pageNum, limit: 12, sortBy: 'createdAt', sortType: 'desc' } })
      .then(({ data }) => {
        const docs = data.data?.docs || [];
        setVideos(prev => append ? [...prev, ...docs] : docs);
        setHasMore(data.data?.hasNextPage || false);
      })
      .catch(() => !append && setVideos([]))
      .finally(() => setter(false));
  }, [query]);

  useEffect(() => {
    setPage(1);
    fetchVideos(1);
  }, [query, fetchVideos]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchVideos(next, true);
  };

  return (
    <div>
      <div className="page-header">
        <h1>{query ? `Results for "${query}"` : 'Discover Videos'}</h1>
        <p>{query ? 'Showing results matching your search' : 'Trending and latest uploads from creators'}</p>
      </div>

      {loading ? (
        <div className="video-grid">
          {[...Array(8)].map((_, i) => <VideoSkeleton key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No videos found</h3>
          <p>{query ? 'Try a different search term' : 'Be the first to upload a video!'}</p>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map((v) => <VideoCard key={v._id} video={v} />)}
          </div>
          {hasMore && (
            <div className="load-more-wrap">
              <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
