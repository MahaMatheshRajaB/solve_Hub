import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Hash } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';

function TrendingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="h-12 bg-gray-800 rounded-xl" />
      ))}
    </div>
  );
}

export default function TrendingPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
    fetchSuggestions();
  }, []);

  const fetchTrending = async () => {
    try {
      const q = query(collection(db, 'hashtags'), orderBy('count', 'desc'), limit(8));
      const snap = await getDocs(q);
      setTrending(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('postCount', 'desc'), limit(5));
      const snap = await getDocs(q);
      setSuggestions(snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.uid !== user?.uid)
        .slice(0, 3)
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside className="hidden lg:block w-72 xl:w-80 sticky top-0 h-screen overflow-y-auto py-6 px-4 space-y-6">
      {/* Trending hashtags */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <h3 className="text-white font-semibold text-sm">Trending</h3>
        </div>
        {loading ? <TrendingSkeleton /> : (
          <div className="space-y-2">
            {trending.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-2">No trends yet</p>
            ) : trending.map(tag => (
              <button
                key={tag.id}
                onClick={() => navigate(`/explore?tag=${tag.id}`)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded-xl transition-all group text-left"
              >
                <div>
                  <p className="text-violet-400 font-medium text-sm group-hover:text-violet-300">#{tag.id}</p>
                  <p className="text-gray-500 text-xs">{tag.count} posts</p>
                </div>
                <Hash className="w-3 h-3 text-gray-600 group-hover:text-violet-400 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Who to follow */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-violet-400" />
          <h3 className="text-white font-semibold text-sm">Who to follow</h3>
        </div>
        <div className="space-y-3">
          {suggestions.map(profile => (
            <div key={profile.uid} className="flex items-center gap-3">
              <Link to={`/profile/${profile.uid}`}>
                <img
                  src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`}
                  alt={profile.displayName}
                  className="w-9 h-9 rounded-full object-cover border border-gray-700 hover:border-violet-500 transition-all"
                />
              </Link>
              <Link to={`/profile/${profile.uid}`} className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate hover:text-violet-400 transition-colors">{profile.displayName}</p>
                <p className="text-gray-500 text-xs">{profile.postCount || 0} posts</p>
              </Link>
              <Link
                to={`/profile/${profile.uid}`}
                className="text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 px-3 py-1 rounded-full transition-all font-medium"
              >
                Follow
              </Link>
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-2">No suggestions</p>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-xs px-1">© 2025 SolveHub · Made with ⚡</p>
    </aside>
  );
}
