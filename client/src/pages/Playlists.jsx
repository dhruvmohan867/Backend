import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash } from 'react-icons/hi';

export default function Playlists() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    API.get(`/playlists/user/${user._id}`)
      .then(({ data }) => setPlaylists(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    try {
      const { data } = await API.post('/playlists', form);
      setPlaylists([data.data, ...playlists]);
      setForm({ name: '', description: '' });
      setShowCreate(false);
      toast.success('Playlist created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deletePlaylist = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/playlists/${id}`);
      setPlaylists(playlists.filter((p) => p._id !== id));
      toast.success('Playlist deleted');
    } catch { toast.error('Failed'); }
  };

  if (!user) return <div className="empty-state"><h3>Sign in to manage playlists</h3></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Playlists</h1>
          <p>Organize your favorite videos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><HiPlus /> New</button>
      </div>

      {showCreate && (
        <form onSubmit={createPlaylist} className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div className="form-group">
            <label>Name *</label>
            <input className="form-control" placeholder="My playlist" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input className="form-control" placeholder="Optional" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-sm" type="submit">Create</button>
        </form>
      )}

      {loading ? <div className="loading"><div className="spinner" /></div> : playlists.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>No playlists</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {playlists.map((p) => (
            <div key={p._id} className="playlist-card" onClick={() => navigate(`/playlists/${p._id}`)}>
              <div className="playlist-thumb">
                {p.previewThumbnail ? <img src={p.previewThumbnail} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--bg-secondary)' }}>📋</div>}
                <div className="playlist-count">{p.totalVideos || 0} videos</div>
              </div>
              <div className="playlist-info" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><h3>{p.name}</h3>{p.description && <p>{p.description}</p>}</div>
                <button className="btn-icon" onClick={(e) => deletePlaylist(e, p._id)} style={{ color: 'var(--danger)' }}><HiTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
