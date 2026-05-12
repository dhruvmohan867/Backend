import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiThumbUp, HiTrash } from 'react-icons/hi';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  const i = [[31536000,'y'],[2592000,'mo'],[86400,'d'],[3600,'h'],[60,'m']];
  for (const [sec, l] of i) { const c = Math.floor(s / sec); if (c >= 1) return `${c}${l} ago`; }
  return 'Just now';
}

export default function Tweets() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTweets = () => {
    if (!user) { setLoading(false); return; }
    API.get(`/tweets/user/${user._id}?page=1&limit=50`)
      .then(({ data }) => setTweets(data.data?.docs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchTweets, [user]);

  const createTweet = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in');
    if (!content.trim()) return;
    if (content.length > 280) return toast.error('Max 280 characters');
    try {
      const { data } = await API.post('/tweets', { content: content.trim() });
      setTweets([data.data, ...tweets]);
      setContent('');
      toast.success('Tweet posted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteTweet = async (id) => {
    try {
      await API.delete(`/tweets/${id}`);
      setTweets(tweets.filter((t) => t._id !== id));
      toast.success('Tweet deleted');
    } catch { toast.error('Failed'); }
  };

  const likeTweet = async (id) => {
    if (!user) return toast.error('Please sign in');
    try {
      const { data } = await API.post(`/likes/toggle/t/${id}`);
      setTweets(tweets.map((t) =>
        t._id === id ? { ...t, likesCount: data.data.likesCount, isLiked: data.data.liked } : t
      ));
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Tweets</h1>
        <p>Short updates from the community</p>
      </div>

      {user && (
        <form onSubmit={createTweet} style={{ marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <img src={user.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <textarea className="form-control" placeholder="What's happening?" maxLength={280}
                  value={content} onChange={(e) => setContent(e.target.value)}
                  style={{ minHeight: '80px', marginBottom: '12px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: content.length > 260 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {content.length}/280
                  </span>
                  <button className="btn btn-primary btn-sm" type="submit">Post</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : tweets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐦</div>
          <h3>No tweets yet</h3>
          <p>{user ? 'Post your first tweet above!' : 'Sign in to see and post tweets'}</p>
        </div>
      ) : (
        tweets.map((t) => (
          <div key={t._id} className="tweet-card">
            <div className="tweet-header">
              <img src={t.owner?.avatar} alt="" className="tweet-avatar" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.owner?.fullname || t.owner?.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{t.owner?.username} • {timeAgo(t.createdAt)}</div>
              </div>
            </div>
            <div className="tweet-content">{t.content}</div>
            <div className="tweet-actions">
              <button className={`btn-ghost btn-sm`} onClick={() => likeTweet(t._id)}
                style={{ fontSize: '0.85rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 4, color: t.isLiked ? 'var(--accent)' : 'var(--text-secondary)' }}>
                <HiThumbUp /> {t.likesCount || 0}
              </button>
              {user && t.owner?._id === user._id && (
                <button className="btn-ghost btn-sm" onClick={() => deleteTweet(t._id)}
                  style={{ fontSize: '0.85rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)' }}>
                  <HiTrash /> Delete
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
