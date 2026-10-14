import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PostCard, PostSkeleton } from '../components/post/PostFeed';
import { CATEGORIES } from '../utils/helpers';
import { Search, Hash, Tag, Filter, CheckCircle2, HelpCircle, X, Sparkles } from 'lucide-react';
import { cn } from '../utils/helpers';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'solved' | 'unsolved'
  const [posts, setPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync selected tag from searchParams if updated
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch posts
      const postsQ = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
      const postsSnap = await getDocs(postsQ);
      setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch trending hashtags
      const tagsQ = query(collection(db, 'hashtags'), orderBy('count', 'desc'), limit(12));
      const tagsSnap = await getDocs(tagsQ);
      setTrendingTags(tagsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag('');
      searchParams.delete('tag');
    } else {
      setSelectedTag(tag);
      searchParams.set('tag', tag);
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSelectedCategory('');
    setStatusFilter('all');
    searchParams.delete('tag');
    setSearchParams(searchParams);
  };

  // Filter posts client-side for fast, reactive search
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search term filter (text, authorName, category)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesText = post.text?.toLowerCase().includes(term);
        const matchesAuthor = post.authorName?.toLowerCase().includes(term);
        const matchesCategory = post.category?.toLowerCase().includes(term);
        const matchesHashtag = post.hashtags?.some(h => h.toLowerCase().includes(term));
        if (!matchesText && !matchesAuthor && !matchesCategory && !matchesHashtag) {
          return false;
        }
      }

      // Hashtag filter
      if (selectedTag) {
        const cleanTag = selectedTag.replace('#', '').toLowerCase();
        if (!post.hashtags?.map(h => h.toLowerCase()).includes(cleanTag)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && post.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'solved' && !post.solved) return false;
      if (statusFilter === 'unsolved' && post.solved) return false;

      return true;
    });
  }, [posts, searchTerm, selectedTag, selectedCategory, statusFilter]);

  const hasActiveFilters = Boolean(searchTerm || selectedTag || selectedCategory || statusFilter !== 'all');

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Explore & Discover</h1>
        
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            id="explore-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems, questions, solutions, or #topics..."
            className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl pl-12 pr-10 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all text-sm backdrop-blur-md shadow-lg shadow-black/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded-full bg-gray-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Trending Hashtag Pills */}
        {trendingTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Trending Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border',
                    selectedTag.toLowerCase() === tag.id.toLowerCase()
                      ? 'bg-violet-600/30 border-violet-500 text-violet-300 shadow-md shadow-violet-500/20'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 hover:bg-gray-800'
                  )}
                >
                  <Hash className="w-3 h-3 text-violet-400" />
                  <span>{tag.id}</span>
                  {tag.count && <span className="text-[10px] text-gray-500 ml-0.5">({tag.count})</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-800/80">
          {/* Status selector */}
          <div className="flex bg-gray-900 rounded-xl p-0.5 border border-gray-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium transition-all',
                statusFilter === 'all' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              )}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('unsolved')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all',
                statusFilter === 'unsolved' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              )}
            >
              <HelpCircle className="w-3 h-3" />
              Unsolved
            </button>
            <button
              onClick={() => setStatusFilter('solved')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all',
                statusFilter === 'solved' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              Solved
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-violet-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Results feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>{filteredPosts.length} {filteredPosts.length === 1 ? 'problem found' : 'problems found'}</span>
          {selectedTag && (
            <span className="text-violet-400">Filtering by #{selectedTag}</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800/60 p-8">
            <div className="w-16 h-16 bg-gray-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-300 font-medium">No results match your criteria</p>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the selected filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded-xl text-sm font-medium transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              onUpdated={(updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
            />
          ))
        )}
      </div>
    </div>
  );
}
