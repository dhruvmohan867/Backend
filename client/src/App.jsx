import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';
import Tweets from './pages/Tweets';
import Dashboard from './pages/Dashboard';
import LikedVideos from './pages/LikedVideos';
import History from './pages/History';
import Playlists from './pages/Playlists';
import Channel from './pages/Channel';

function Layout() {
  const location = useLocation();
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(location.pathname);

  if (isAuthPage) {
    return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>;
  }

  return (
    <>
      <Header />
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/video/:videoId" element={<VideoPlayer />} />
            <Route path="/tweets" element={<Tweets />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/liked" element={<LikedVideos />} />
            <Route path="/history" element={<History />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/channel/:username" element={<Channel />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
        <Toaster position="bottom-right" toastOptions={{
          style: { background: '#1a1a2e', color: '#e8e8e8', border: '1px solid rgba(255,255,255,0.06)' }
        }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
