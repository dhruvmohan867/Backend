import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiTrendingUp, HiHeart, HiClock, HiCollection, HiChatAlt2, HiChartBar, HiCog } from 'react-icons/hi';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <NavLink to="/" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <HiHome /> Home
      </NavLink>
      <NavLink to="/tweets" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <HiChatAlt2 /> Tweets
      </NavLink>

      {user && (
        <>
          <div className="sidebar-divider" />
          <NavLink to="/liked" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <HiHeart /> Liked Videos
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <HiClock /> History
          </NavLink>
          <NavLink to="/playlists" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <HiCollection /> Playlists
          </NavLink>
          <div className="sidebar-divider" />
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <HiChartBar /> Dashboard
          </NavLink>
          <NavLink to={`/channel/${user.username}`} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <HiCog /> My Channel
          </NavLink>
        </>
      )}
    </aside>
  );
}
