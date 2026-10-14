import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostFeed from '../components/post/PostFeed';
import CreatePost from '../components/post/CreatePost';
import { CATEGORIES } from '../utils/helpers';
import { Sparkles, Users, HelpCircle, CheckCircle2, Filter, X } from 'lucide-react';
import { cn } from '../utils/helpers';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('foryou');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const closeCreateModal = () => {
    setShowCreateModal(false);
    if (searchParams.get('new')) {
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  };

  const tabs = [
    { id: 'foryou', label: 'For You', icon: Sparkles },
    { id: 'following', label: 'Following', icon: Users },
    { id: 'unsolved', label: 'Unsolved', icon: HelpCircle },
    { id: 'solved', label: 'Solved', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Header & Tabs */}
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-xl pt-1 pb-3 -mx-4 px-4 border-b border-gray-800/80">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white tracking-tight">Community Feed</h1>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="flex items-center gap-1.5 text-xs bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 px-2.5 py-1 rounded-full transition-all"
            >
              <span>Category: {selectedCategory}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative',
                activeTab === id
                  ? 'bg-violet-600/20 text-violet-400 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {activeTab === id && (
                <div className="absolute -bottom-2 left-2 right-2 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Category horizontal scroll */}
        <div className="flex gap-1.5 overflow-x-auto pt-2.5 pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              !selectedCategory
                ? 'bg-gray-800 text-white font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
                selectedCategory === cat
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                  : 'border-gray-800/80 text-gray-400 hover:text-gray-200 hover:border-gray-700 bg-gray-900/40'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Create Post box */}
      <CreatePost onCreated={() => setRefreshKey(k => k + 1)} />

      {/* Modal for when triggered via URL ?new=true */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl animate-in">
            <button
              onClick={closeCreateModal}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white bg-gray-800/80 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
            <CreatePost
              onClose={closeCreateModal}
              onCreated={() => {
                closeCreateModal();
                setRefreshKey(k => k + 1);
              }}
            />
          </div>
        </div>
      )}

      {/* Feed */}
      <PostFeed
        key={`${activeTab}-${selectedCategory}-${refreshKey}`}
        tab={activeTab}
        category={selectedCategory}
      />
    </div>
  );
}
