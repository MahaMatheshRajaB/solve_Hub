import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, getDocs, limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PostCard, PostSkeleton } from '../components/post/PostFeed';
import { Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('bookmarks', 'array-contains', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Bookmarks</h1>
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <PostSkeleton key={i} />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400">No bookmarks yet</p>
          <p className="text-gray-600 text-sm mt-1">Bookmark posts to save them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
