import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationStore } from '../../store';
import { Home, Search, Bell, Bookmark, User, PlusCircle, Zap } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function BottomNav() {
  const { user } = useAuth();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Alerts', path: '/notifications', badge: unreadCount },
    { icon: Bookmark, label: 'Saved', path: '/bookmarks' },
    { icon: User, label: 'Profile', path: `/profile/${user?.uid}` },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 flex items-center px-2 safe-area-inset-bottom">
      {navItems.slice(0, 2).map(({ icon: Icon, label, path, badge }) => {
        const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return (
          <Link key={path} to={path} className={cn('flex-1 flex flex-col items-center py-3 gap-0.5 relative transition-colors', active ? 'text-violet-400' : 'text-gray-500')}>
            <div className="relative">
              <Icon className="w-6 h-6" />
              {badge > 0 && <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge > 9 ? '9+' : badge}</span>}
            </div>
            <span className="text-[10px]">{label}</span>
          </Link>
        );
      })}

      {/* Center new post button */}
      <button
        onClick={() => navigate('/?new=true')}
        className="flex-1 flex flex-col items-center py-2"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/40 -mt-4">
          <PlusCircle className="w-6 h-6 text-white" />
        </div>
      </button>

      {navItems.slice(3).map(({ icon: Icon, label, path, badge }) => {
        const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return (
          <Link key={path} to={path} className={cn('flex-1 flex flex-col items-center py-3 gap-0.5 relative transition-colors', active ? 'text-violet-400' : 'text-gray-500')}>
            <div className="relative">
              <Icon className="w-6 h-6" />
              {badge > 0 && <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge > 9 ? '9+' : badge}</span>}
            </div>
            <span className="text-[10px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
