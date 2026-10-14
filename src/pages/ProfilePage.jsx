import { useState, useEffect } from 'react';
import {
  doc, getDoc, collection, query, where, orderBy, getDocs,
  updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { PostCard } from '../components/post/PostFeed';
import {
  Users, Grid3X3, UserPlus, UserMinus, Edit3, Camera, Loader2, Link2
} from 'lucide-react';
import { cn } from '../utils/helpers';
import toast from 'react-hot-toast';

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-40 bg-gray-800 rounded-2xl mb-4" />
      <div className="flex items-end gap-4 -mt-12 mb-6 px-4">
        <div className="w-24 h-24 bg-gray-700 rounded-2xl border-4 border-gray-950" />
        <div className="flex-1 mb-2 space-y-2">
          <div className="h-5 bg-gray-700 rounded w-40" />
          <div className="h-3 bg-gray-800 rounded w-60" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { uid } = useParams();
  const { user, profile: myProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isMe = user?.uid === uid;
  const isFollowing = myProfile?.following?.includes(uid);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [uid]);

  const fetchProfile = async () => {
    setLoading(true);
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      setProfile(data);
      setBio(data.bio || '');
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    setPostsLoading(true);
    const q = query(collection(db, 'posts'), where('authorId', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setPostsLoading(false);
  };

  const handleFollow = async () => {
    if (!user || isMe) return;
    const myRef = doc(db, 'users', user.uid);
    const theirRef = doc(db, 'users', uid);
    if (isFollowing) {
      await updateDoc(myRef, { following: arrayRemove(uid) });
      await updateDoc(theirRef, { followers: arrayRemove(user.uid) });
      toast('Unfollowed');
    } else {
      await updateDoc(myRef, { following: arrayUnion(uid) });
      await updateDoc(theirRef, { followers: arrayUnion(user.uid) });
      await addDoc(collection(db, 'notifications'), {
        toUserId: uid,
        fromUserId: user.uid,
        fromUserName: myProfile?.displayName || user.displayName,
        fromUserPhoto: myProfile?.photoURL || user.photoURL,
        type: 'follow',
        read: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Following!');
    }
    await refreshProfile();
    await fetchProfile();
  };

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { bio });
      await refreshProfile();
      setProfile(prev => ({ ...prev, bio }));
      setEditMode(false);
      toast.success('Bio updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !isMe) return;
    setUploading(true);
    try {
      const imgRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(imgRef, file);
      const url = await getDownloadURL(imgRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      await refreshProfile();
      setProfile(prev => ({ ...prev, photoURL: url }));
      toast.success('Avatar updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <ProfileSkeleton />
    </div>
  );

  if (!profile) return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <p className="text-gray-400">User not found</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Banner */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 rounded-2xl border border-gray-800" />

        {/* Avatar */}
        <div className="absolute -bottom-12 left-4">
          <div className="relative">
            <img
              src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`}
              alt={profile.displayName}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-950"
            />
            {isMe && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 rounded-2xl transition-all cursor-pointer">
                {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {isMe ? (
            <button
              onClick={() => setEditMode(m => !m)}
              id="edit-profile-btn"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-all border border-gray-700"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              id="follow-btn"
              className={cn(
                'flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all',
                isFollowing
                  ? 'bg-gray-800 hover:bg-red-500/10 hover:text-red-400 text-white border border-gray-700'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white'
              )}
            >
              {isFollowing ? <><UserMinus className="w-4 h-4" />Unfollow</> : <><UserPlus className="w-4 h-4" />Follow</>}
            </button>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-14 px-1 space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
          <p className="text-gray-500 text-sm">{profile.email}</p>
        </div>

        {editMode ? (
          <div className="space-y-2">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveBio}
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save
              </button>
              <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-xl transition-all">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          profile.bio && <p className="text-gray-300">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-white font-bold">{profile.postCount || 0}</p>
            <p className="text-gray-500 text-xs">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold">{profile.followers?.length || 0}</p>
            <p className="text-gray-500 text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold">{profile.following?.length || 0}</p>
            <p className="text-gray-500 text-xs">Following</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Posts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Grid3X3 className="w-4 h-4" />
          <span className="text-sm font-medium">Posts</span>
        </div>
        {postsLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-800 rounded-2xl" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No posts yet</p>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
