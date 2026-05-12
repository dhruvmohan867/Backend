import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiTrash } from 'react-icons/hi';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  const i = [[31536000,'y'],[2592000,'mo'],[86400,'d'],[3600,'h'],[60,'m']];
  for (const [sec, l] of i) { const c = Math.floor(s / sec); if (c >= 1) return `${c}${l} ago`; }
  return 'Just now';
}

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/playlists/${playlistId}`)
      .then(({ data }) => setPlaylist(data.data))
      .catch(() => toast.error('Playlist not found'))
      .finally(() => setLoading(false));
  }, [playlistId]);

  const removeVideo = async (videoId) => {
    try {
      await API.patch(`/playlists/remove/${videoId}/${playlistId}`);
      setPlaylist(p => ({ ...p, videos: p.videos.filter(v => v._id !== videoId) }));
      toast.success('Removed from playlist');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!playlist) return <div className="empty-state"><h3>Playlist not found</h3></div>;

  const isOwner = user && playlist.owner?._id === user._id;

  return (
    <div>
      <div className="playlist-header">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>{playlist.name}</h2>
        {playlist.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{playlist.description}</p>}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>{playlist.videos?.length || 0} videos</div>
      </div>

      {(!playlist.videos || playlist.videos.length === 0) ? (
        <div className="empty-state"><h3>No videos in this playlist</h3></div>
      ) : (
        playlist.videos.map((v, i) => (
          <div key={v._id} className="playlist-video-item" style={{ animationDelay: `${i * 0.05}s`, animation: 'fadeInUp 0.3s ease both' }}>
            <img src={v.thumbnail} alt="" onClick={() => navigate(`/video/${v._id}`)} />
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/video/${v._id}`)}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{v.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {v.views || 0} views • {timeAgo(v.createdAt)}
              </div>
            </div>
            {isOwner && (
              <button className="btn-icon" onClick={() => removeVideo(v._id)} style={{ color: 'var(--danger)' }}><HiTrash /></button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
