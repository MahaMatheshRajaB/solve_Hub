import { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Image, X, Loader2, Sparkles, Wand2, Hash } from 'lucide-react';
import { extractHashtags, CATEGORIES } from '../../utils/helpers';
import { aiImprove } from '../../lib/gemini';
import toast from 'react-hot-toast';
import { cn } from '../../utils/helpers';

export default function CreatePost({ onClose, onCreated }) {
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImprove = async () => {
    if (!text.trim()) { toast.error('Write something first'); return; }
    setImproving(true);
    try {
      const { improved } = await aiImprove(text, category);
      setText(improved);
      toast.success('Post improved by SolveBot ✨');
    } catch (e) {
      toast.error('AI unavailable. Check your API connection.');
    } finally {
      setImproving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { toast.error('Please write your problem'); return; }
    setLoading(true);
    try {
      let imageUrl = null;
      if (image) {
        const imgRef = ref(storage, `posts/${user.uid}/${Date.now()}_${image.name}`);
        const snap = await uploadBytes(imgRef, image);
        imageUrl = await getDownloadURL(snap.ref);
      }

      const hashtags = extractHashtags(text);
      const postRef = await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName,
        authorPhoto: profile?.photoURL || user.photoURL,
        text: text.trim(),
        category: category || 'Other',
        imageUrl,
        hashtags,
        likes: [],
        bookmarks: [],
        commentCount: 0,
        solved: false,
        createdAt: serverTimestamp(),
      });

      // Update hashtag counts
      for (const tag of hashtags) {
        const tagRef = doc(db, 'hashtags', tag);
        const tagSnap = await getDoc(tagRef);
        if (tagSnap.exists()) {
          await updateDoc(tagRef, { count: increment(1) });
        } else {
          await setDoc(tagRef, { count: 1 });
        }
      }

      // Update user post count
      await updateDoc(doc(db, 'users', user.uid), { postCount: increment(1) });

      toast.success('Problem posted! 🚀');
      onCreated?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const maxChars = 500;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6">
      <div className="flex items-start gap-3">
        <img
          src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 flex-shrink-0"
        />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              id="post-text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What problem are you trying to solve? Use #hashtags..."
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg min-h-[120px]"
              maxLength={maxChars}
            />

            {imagePreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-700">
                <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-gray-900/80 backdrop-blur-sm rounded-full p-1 hover:bg-gray-800 transition-all"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500"
              >
                <option value="">Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                  title="Add image"
                >
                  <Image className="w-5 h-5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

                <button
                  type="button"
                  onClick={handleImprove}
                  disabled={improving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all disabled:opacity-50"
                  title="Improve with AI"
                >
                  {improving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">Improve</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn('text-xs', charCount > maxChars * 0.8 ? 'text-orange-400' : 'text-gray-500')}>
                  {charCount}/{maxChars}
                </span>
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  id="submit-post-btn"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-5 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Post Problem
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
