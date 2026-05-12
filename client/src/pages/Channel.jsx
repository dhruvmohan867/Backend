import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/users/c/${username}`)
      .then(({ data }) => {
        setChannel(data.data);
        setSubscribed(data.data.isSubscribed);
        return API.get(`/videos?userId=${data.data._id}&page=1&limit=20`);
      })
      .then(({ data }) => setVideos(data.data?.docs || []))
      .catch(() => toast.error('Channel not found'))
      .finally(() => setLoading(false));
  }, [username]);

  const toggleSub = async () => {
    if (!user) return toast.error('Please sign in');
    try {
      const { data } = await API.post(`/subscriptions/c/${channel._id}`);
      setSubscribed(data.data.subscribed);
      setChannel({ ...channel, subscribersCount: data.data.subscribersCount });
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

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Videos</h3>
        {videos.length === 0 ? (
          <div className="empty-state"><h3>No videos yet</h3></div>
        ) : (
          <div className="video-grid">
            {videos.map((v) => <VideoCard key={v._id} video={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
