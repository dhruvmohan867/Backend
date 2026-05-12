import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiFilm, HiPhotograph, HiX } from 'react-icons/hi';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(null);

  if (!user) { navigate('/login'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return toast.error('Video file is required');
    if (!thumbnail) return toast.error('Thumbnail is required');
    if (!form.title.trim()) return toast.error('Title is required');

    setLoading(true);
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('videoFile', videoFile);
    fd.append('thumbnail', thumbnail);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await API.post('/videos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal,
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      toast.success('Video published successfully!');
      navigate('/');
    } catch (err) {
      if (err.name === 'CanceledError') { toast.success('Upload cancelled'); }
      else { toast.error(err.response?.data?.message || 'Upload failed'); }
    } finally {
      setLoading(false);
      setProgress(0);
      abortRef.current = null;
    }
  };

  const cancelUpload = () => {
    if (abortRef.current) abortRef.current.abort();
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Upload Video</h1>
        <p>Share your content with the world</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Video File *</label>
          <div className="file-upload" style={{ padding: '48px 32px' }}>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
            <div className="file-icon"><HiFilm /></div>
            <div className="file-text">{videoFile ? '' : 'Drop your video here or click to browse'}</div>
            {videoFile && <div className="file-name">📹 {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</div>}
          </div>
        </div>

        <div className="form-group">
          <label>Thumbnail *</label>
          <div className="file-upload">
            <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />
            <div className="file-icon"><HiPhotograph /></div>
            <div className="file-text">{thumbnail ? '' : 'Choose a thumbnail image'}</div>
            {thumbnail && <div className="file-name">🖼️ {thumbnail.name}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input className="form-control" placeholder="Give your video a catchy title" maxLength={100}
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea className="form-control" placeholder="Tell viewers about your video..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
        </div>

        {loading && progress > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient-1)', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
            {loading ? `Uploading... ${progress}%` : 'Publish Video'}
          </button>
          {loading && (
            <button type="button" className="btn btn-secondary btn-lg" onClick={cancelUpload}>
              <HiX /> Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
