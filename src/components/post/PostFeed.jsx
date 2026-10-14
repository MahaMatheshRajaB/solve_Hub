import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, limit, getDocs,
  doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, addDoc,
  serverTimestamp, onSnapshot, getDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Bookmark, Share2, Trash2, Bot,
  CheckCircle2, Tag, MoreHorizontal, Loader2
} from 'lucide-react';
import { formatRelativeTime, highlightHashtags, sharePost } from '../../utils/helpers';
import { aiSolve } from '../../lib/gemini';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';
import { cn } from '../../utils/helpers';

function PostSkeleton() {
  return (
    <div className="animate-pulse bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-800 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-800 rounded w-32" />
          <div className="h-2 bg-gray-800 rounded w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-4/5" />
        <div className="h-3 bg-gray-800 rounded w-3/5" />
      </div>
    </div>
  );
}

function PostCard({ post, onDeleted, onUpdated }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.likes?.includes(user?.uid));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [bookmarked, setBookmarked] = useState(post.bookmarks?.includes(user?.uid));
  const [askingAI, setAskingAI] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?.uid === post.authorId;

  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    if (liked) {
      await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      setLiked(false);
      setLikeCount(c => c - 1);
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) });
      setLiked(true);
      setLikeCount(c => c + 1);
      // Notify post author
      if (post.authorId !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          toUserId: post.authorId,
          fromUserId: user.uid,
          fromUserName: profile?.displayName || user.displayName,
          fromUserPhoto: profile?.photoURL || user.photoURL,
          type: 'like',
          postId: post.id,
          postText: post.text.slice(0, 60),
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    if (bookmarked) {
      await updateDoc(postRef, { bookmarks: arrayRemove(user.uid) });
      setBookmarked(false);
      toast('Removed from bookmarks');
    } else {
      await updateDoc(postRef, { bookmarks: arrayUnion(user.uid) });
      setBookmarked(true);
      toast.success('Bookmarked!');
    }
  };

  const handleShare = () => {
    const url = sharePost(post.id);
    toast.success('Link copied!');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      toast.success('Post deleted');
      onDeleted?.(post.id);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleAskAI = async () => {
    if (!user) return;
    setAskingAI(true);
    try {
      const { solution } = await aiSolve(post.text, post.category);
      // Add as a comment
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        authorId: 'solvebot',
        authorName: 'SolveBot',
        authorPhoto: null,
        isAI: true,
        text: solution,
        createdAt: serverTimestamp(),
        helpful: false,
      });
      await updateDoc(doc(db, 'posts', post.id), { commentCount: (post.commentCount || 0) + 1 });
      setShowComments(true);
      toast.success('SolveBot added a solution! 🤖');
    } catch (e) {
      toast.error('AI unavailable. Check your backend connection.');
    } finally {
      setAskingAI(false);
    }
  };

  return (
    <article className="bg-gray-900/60 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.authorId}`}>
            <img
              src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`}
              alt={post.authorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 hover:border-violet-500 transition-all"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post.authorId}`} className="text-white font-semibold text-sm hover:text-violet-400 transition-colors">
                {post.authorName}
              </Link>
              {post.solved && (
                <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Solved
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span>{formatRelativeTime(post.createdAt)}</span>
              {post.category && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          {isOwner && (
            <button
              onClick={() => setShowMenu(m => !m)}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-xl py-1 z-10 min-w-[140px] shadow-xl">
              <button
                onClick={() => { handleDelete(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 text-sm transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post text */}
      <Link to={`/post/${post.id}`}>
        <p
          className="text-gray-200 leading-relaxed mb-3 hover:text-white transition-colors"
          dangerouslySetInnerHTML={{ __html: highlightHashtags(post.text) }}
        />
      </Link>

      {/* Post image */}
      {post.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-800 mb-3">
          <img src={post.imageUrl} alt="post" className="w-full max-h-80 object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-gray-800">
        <button
          onClick={handleLike}
          id={`like-btn-${post.id}`}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
            liked ? 'text-pink-400 bg-pink-500/10' : 'text-gray-500 hover:text-pink-400 hover:bg-pink-500/10'
          )}
        >
          <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>

        <button
          onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentCount > 0 ? post.commentCount : ''}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
            bookmarked ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10'
          )}
        >
          <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleAskAI}
          disabled={askingAI}
          id={`ask-ai-btn-${post.id}`}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all disabled:opacity-50"
          title="Ask SolveBot"
        >
          {askingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          <span className="hidden sm:inline text-xs">Ask AI</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <CommentSection postId={post.id} postAuthorId={post.authorId} />
      )}
    </article>
  );
}

export default function PostFeed({ tab = 'foryou', category = '' }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let q;
      if (tab === 'following') {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const following = userSnap.data()?.following || [];
        if (following.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        q = query(
          collection(db, 'posts'),
          where('authorId', 'in', following.slice(0, 10)),
          orderBy('createdAt', 'desc'),
          limit(40)
        );
      } else {
        q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
      }
      const snap = await getDocs(q);
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Apply category filter
      if (category) {
        docs = docs.filter(p => p.category === category);
      }

      // Apply tab filter for solved / unsolved
      if (tab === 'unsolved') {
        docs = docs.filter(p => !p.solved);
      } else if (tab === 'solved') {
        docs = docs.filter(p => !!p.solved);
      }

      setPosts(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab, category, user?.uid]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time listener for new posts
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(1));
    const unsub = onSnapshot(q, () => {
      fetchPosts();
    });
    return unsub;
  }, [fetchPosts]);

  const handleDeleted = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium">No posts yet</p>
        <p className="text-gray-600 text-sm mt-1">
          {tab === 'following' ? 'Follow people to see their posts here' : 'Be the first to post a problem!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onDeleted={handleDeleted}
          onUpdated={(updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
        />
      ))}
    </div>
  );
}

export { PostCard, PostSkeleton };
