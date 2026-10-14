import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationStore } from '../store';
import { Bell, Heart, MessageCircle, UserPlus, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import { Link } from 'react-router-dom';
import { cn } from '../utils/helpers';

function NotifIcon({ type }) {
  if (type === 'like') return <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />;
  if (type === 'comment') return <MessageCircle className="w-4 h-4 text-blue-400" />;
  if (type === 'follow') return <UserPlus className="w-4 h-4 text-violet-400" />;
  return <Bell className="w-4 h-4 text-gray-400" />;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { setUnreadCount } = useNotificationStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(notifs);
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true });
    }
    setUnreadCount(0);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="animate-pulse space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-800 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            id="mark-all-read-btn"
            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400">No notifications yet</p>
          <p className="text-gray-600 text-sm mt-1">When people interact with your posts, you'll see it here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-2xl border transition-all',
                notif.read
                  ? 'bg-gray-900/40 border-gray-800'
                  : 'bg-violet-500/5 border-violet-500/20'
              )}
            >
              <div className="relative flex-shrink-0">
                <Link to={`/profile/${notif.fromUserId}`}>
                  <img
                    src={notif.fromUserPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.fromUserId}`}
                    alt={notif.fromUserName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                  />
                </Link>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800">
                  <NotifIcon type={notif.type} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm leading-relaxed">
                  <Link to={`/profile/${notif.fromUserId}`} className="font-semibold text-white hover:text-violet-400 transition-colors">
                    {notif.fromUserName}
                  </Link>
                  {' '}
                  {notif.type === 'like' && 'liked your post'}
                  {notif.type === 'comment' && 'commented on your post'}
                  {notif.type === 'follow' && 'started following you'}
                  {notif.postText && (
                    <span className="text-gray-500"> — "{notif.postText}{notif.postText?.length >= 60 ? '...' : ''}"</span>
                  )}
                </p>
                <p className="text-gray-600 text-xs mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
