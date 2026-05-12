import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiThumbUp, HiShare, HiBookmark } from 'react-icons/hi';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  const i = [[31536000,'y'],[2592000,'mo'],[86400,'d'],[3600,'h'],[60,'m']];
  for (const [sec, l] of i) { const c = Math.floor(s / sec); if (c >= 1) return `${c}${l} ago`; }
  return 'Just now';
}

// Transform Cloudinary video URL to force browser-compatible MP4/H.264 delivery
function getStreamableUrl(url) {
  if (!url) return '';
  // Insert Cloudinary transformation after /upload/
  return url.replace('/upload/', '/upload/f_mp4,vc_h264,q_auto/');
}

export default function VideoPlayer() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/videos/${videoId}`)
      .then(({ data }) => { setVideo(data.data); })
      .catch(() => toast.error('Video not found'))
      .finally(() => setLoading(false));

    API.get(`/comments/${videoId}?page=1&limit=50`)
      .then(({ data }) => setComments(data.data?.docs || []))
      .catch(() => {});
  }, [videoId]);

  const toggleLike = async () => {
    if (!user) return toast.error('Please sign in');
    try {
      const { data } = await API.post(`/likes/toggle/v/${videoId}`);
      setLiked(data.data.liked);
      setLikesCount(data.data.likesCount);
    } catch { toast.error('Failed'); }
  };

  const toggleSubscribe = async () => {
    if (!user) return toast.error('Please sign in');
    try {
      const { data } = await API.post(`/subscriptions/c/${video.owner._id}`);
      setSubscribed(data.data.subscribed);
      toast.success(data.data.subscribed ? 'Subscribed!' : 'Unsubscribed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in');
    if (!commentText.trim()) return;
    try {
      const { data } = await API.post(`/comments/${videoId}`, { content: commentText });
      setComments([data.data, ...comments]);
      setCommentText('');
      toast.success('Comment added');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!video) return <div className="empty-state"><h3>Video not found</h3></div>;

  return (
    <div className="video-player-container">
      <div>
        <video controls autoPlay src={getStreamableUrl(video.videofile)} poster={video.thumbnail} />
        <div className="video-details">
          <h1>{video.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {video.views?.toLocaleString()} views • {timeAgo(video.createdAt)}
            </span>
            <div className="video-actions">
              <button className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-secondary'}`} onClick={toggleLike}>
                <HiThumbUp /> {likesCount || 'Like'}
              </button>
              <button className="btn btn-secondary btn-sm"><HiShare /> Share</button>
              <button className="btn btn-secondary btn-sm"><HiBookmark /> Save</button>
            </div>
          </div>

          <div className="channel-bar">
            {video.owner?.avatar && <img src={video.owner.avatar} alt="" />}
            <div style={{ flex: 1 }}>
              <div className="channel-name">{video.owner?.fullname}</div>
              <div className="channel-subs">@{video.owner?.username}</div>
            </div>
            {user && video.owner?._id !== user._id && (
              <button className={`btn btn-sm ${subscribed ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleSubscribe}>
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          {video.description && (
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', marginTop: '12px', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {video.description}
            </div>
          )}
        </div>

        {/* Comments */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>{comments.length} Comments</h3>
          {user && (
            <form className="comment-form" onSubmit={addComment}>
              <img src={user.avatar} alt="" className="comment-avatar" />
              <input className="form-control" placeholder="Add a comment..." value={commentText}
                onChange={(e) => setCommentText(e.target.value)} />
              <button className="btn btn-primary btn-sm" type="submit">Post</button>
            </form>
          )}
          {comments.map((c) => (
            <div key={c._id} className="comment">
              <img src={c.owner?.avatar || ''} alt="" className="comment-avatar" />
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-user">@{c.owner?.username}</span>
                  <span className="comment-date">{timeAgo(c.createdAt)}</span>
                </div>
                <div className="comment-text">{c.content}</div>
                <div className="comment-actions">
                  <button className="btn-ghost btn-sm" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                    <HiThumbUp style={{ marginRight: 4 }} /> {c.likesCount || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right sidebar - Suggested */}
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Related</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
          Related videos coming soon
        </div>
      </div>
    </div>
  );
}
