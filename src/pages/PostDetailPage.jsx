import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PostCard, PostSkeleton } from '../components/post/PostFeed';
import { ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDoc(doc(db, 'posts', id));
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });
      } else {
        setError('Post not found');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white bg-gray-900/60 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-sm font-semibold text-gray-300">Problem & Discussion</span>
      </div>

      {loading ? (
        <PostSkeleton />
      ) : error ? (
        <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-800 p-8 space-y-3">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto" />
          <h2 className="text-lg font-semibold text-white">{error}</h2>
          <p className="text-gray-400 text-sm">The post you are looking for may have been deleted or is unavailable.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all"
          >
            Go to Feed
          </button>
        </div>
      ) : (
        <PostCard
          post={post}
          onDeleted={() => navigate('/')}
          onUpdated={(updated) => setPost(updated)}
        />
      )}
    </div>
  );
}
