import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('videos');

  useEffect(() => {
    setLoading(true);
    API.get(`/users/c/${username}`)
      .then(({ data }) => {
        setChannel(data.data);
        setSubscribed(data.data.isSubscribed);
        return Promise.all([
          API.get(`/videos?userId=${data.data._id}&page=1&limit=20`),
          API.get(`/playlists/user/${data.data._id}`)
        ]);
      })
      .then(([vRes, pRes]) => {
        setVideos(vRes.data.data?.docs || []);
        setPlaylists(pRes.data.data || []);
      })
      .catch(() => toast.error('Channel not found'))
      .finally(() => setLoading(false));
  }, [username]);

  const toggleSub = async () => {
    if (!user) return toast.error('Please sign in');
    try {
      const { data } = await API.post(`/subscriptions/c/${channel._id}`);
      setSubscribed(data.data.subscribed);
      setChannel({ ...channel, subscribersCount: data.data.subscribersCount ?? (subscribed ? channel.subscribersCount - 1 : channel.subscribersCount + 1) });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!channel) return <div className="empty-state"><h3>Channel not found</h3></div>;

  return (
    <div>
      <div className="channel-banner">
        {channel.coverImage ? <img src={channel.coverImage} alt="" /> : <div style={{ width: '100%', height: '100%', background: 'var(--gradient-1)' }} />}
      </div>
      <div className="channel-profile">
        <img src={channel.avatar} alt="" />
        <div className="channel-profile-info" style={{ flex: 1 }}>
          <h2>{channel.fullname}</h2>
          <div className="channel-stats">
            <span>@{channel.username}</span>
            <span>{channel.subscribersCount} subscribers</span>
            <span>{videos.length} videos</span>
          </div>
        </div>
        {user && channel._id !== user._id && (
          <button className={`btn ${subscribed ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleSub}>
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>

      <div className="channel-tabs">
        <button className={`channel-tab ${tab === 'videos' ? 'active' : ''}`} onClick={() => setTab('videos')}>Videos</button>
        <button className={`channel-tab ${tab === 'playlists' ? 'active' : ''}`} onClick={() => setTab('playlists')}>Playlists</button>
        <button className={`channel-tab ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')}>About</button>
      </div>

      {tab === 'videos' && (
        videos.length === 0 ? (
          <div className="empty-state"><h3>No videos yet</h3></div>
        ) : (
          <div className="video-grid">
            {videos.map(v => <VideoCard key={v._id} video={v} />)}
          </div>
        )
      )}

      {tab === 'playlists' && (
        playlists.length === 0 ? (
          <div className="empty-state"><h3>No playlists</h3></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {playlists.map(p => (
              <div key={p._id} className="playlist-card" onClick={() => navigate(`/playlists/${p._id}`)}>
                <div className="playlist-thumb">
                  {p.previewThumbnail ? <img src={p.previewThumbnail} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--bg-secondary)' }}>📋</div>}
                  <div className="playlist-count">{p.totalVideos || 0} videos</div>
                </div>
                <div className="playlist-info">
                  <h3>{p.name}</h3>
                  {p.description && <p>{p.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'about' && (
        <div className="card" style={{ padding: 28, maxWidth: 500 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Username</div>
            <div style={{ fontWeight: 600 }}>@{channel.username}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Subscribers</div>
            <div style={{ fontWeight: 600 }}>{channel.subscribersCount}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Following</div>
            <div style={{ fontWeight: 600 }}>{channel.channelsSubscribedToCount || 0} channels</div>
          </div>
        </div>
      )}
    </div>
  );
}
