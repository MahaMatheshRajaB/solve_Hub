import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeStore, useNotificationStore } from '../../store';
import {
  Zap, Home, Search, Bell, Bookmark, User, LogOut, Sun, Moon, PlusCircle, Settings
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: User, label: 'Profile', path: `/profile/${user?.uid}` },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 w-64 xl:w-72 border-r border-gray-800 bg-gray-950 px-4 py-6 justify-between overflow-y-auto">
      <div>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 px-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            SolveHub
          </span>
        </Link>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map(({ icon: Icon, label, path, badge }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                id={`nav-${label.toLowerCase()}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group relative',
                  active
                    ? 'bg-violet-600/20 text-violet-400'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'text-violet-400')} />
                <span>{label}</span>
                {badge > 0 && (
                  <span className="ml-auto bg-violet-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* New Post Button */}
        <button
          id="new-post-btn"
          onClick={() => navigate('/?new=true')}
          className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
        >
          <PlusCircle className="w-5 h-5" />
          New Post
        </button>
      </div>

      <div className="space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          id="theme-toggle"
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="text-sm">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* User profile strip */}
        <Link
          to={`/profile/${user?.uid}`}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 transition-all group"
        >
          <img
            src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover border-2 border-gray-700 group-hover:border-violet-500 transition-all"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.displayName}</p>
            <p className="text-gray-500 text-xs truncate">{profile?.email}</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          id="logout-btn"
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
