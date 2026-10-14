import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, doc, updateDoc, getDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Bot, Send, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';
import { cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

function CommentSkeleton() {
  return (
    <div className="animate-pulse flex gap-3 py-3">
      <div className="w-8 h-8 bg-gray-800 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-800 rounded w-24" />
        <div className="h-3 bg-gray-800 rounded w-full" />
      </div>
    </div>
  );
}

export default function CommentSection({ postId, postAuthorId }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName,
        authorPhoto: profile?.photoURL || user.photoURL,
        isAI: false,
        text: text.trim(),
        createdAt: serverTimestamp(),
        helpful: false,
      });
      // Update comment count on post
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: comments.length + 1,
      });
      // Notify post author
      if (postAuthorId !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          toUserId: postAuthorId,
          fromUserId: user.uid,
          fromUserName: profile?.displayName || user.displayName,
          fromUserPhoto: profile?.photoURL || user.photoURL,
          type: 'comment',
          postId,
          postText: text.trim().slice(0, 60),
          read: false,
          createdAt: serverTimestamp(),
        });
      }
      setText('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (commentId) => {
    if (user?.uid !== postAuthorId) return;
    try {
      // Unmark all first
      for (const c of comments) {
        if (c.helpful) {
          await updateDoc(doc(db, 'posts', postId, 'comments', c.id), { helpful: false });
        }
      }
      // Mark selected
      await updateDoc(doc(db, 'posts', postId, 'comments', commentId), { helpful: true });
      // Mark post as solved
      await updateDoc(doc(db, 'posts', postId), { solved: true });
      toast.success('Marked as helpful! Post marked as Solved ✅');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-800 animate-in">
      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <img
          src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border border-gray-700 flex-shrink-0"
        />
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Post your solution..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-3 py-2 transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Comments */}
      <div className="space-y-3">
        {loading ? (
          <>{[1, 2].map(i => <CommentSkeleton key={i} />)}</>
        ) : comments.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-2">No solutions yet. Be the first!</p>
        ) : (
          comments.map(comment => (
            <div
              key={comment.id}
              className={cn(
                'flex gap-3 p-3 rounded-xl transition-all',
                comment.helpful && 'bg-emerald-500/10 border border-emerald-500/30',
                comment.isAI && 'bg-violet-500/10 border border-violet-500/20'
              )}
            >
              {comment.isAI ? (
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              ) : (
                <img
                  src={comment.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`}
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-700 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-sm font-semibold', comment.isAI ? 'text-violet-400' : 'text-white')}>
                    {comment.authorName}
                  </span>
                  {comment.isAI && (
                    <span className="text-xs bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full">AI</span>
                  )}
                  {comment.helpful && (
                    <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Helpful
                    </span>
                  )}
                  <span className="text-gray-600 text-xs ml-auto">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{comment.text}</p>

                {/* Mark as helpful (only post author can do this) */}
                {user?.uid === postAuthorId && !comment.helpful && (
                  <button
                    onClick={() => markHelpful(comment.id)}
                    className="mt-2 text-xs text-gray-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Mark as helpful
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
