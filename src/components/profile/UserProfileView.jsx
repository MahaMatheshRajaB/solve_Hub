import { useState, useMemo } from 'react';
import { useSolveHubStore } from '../../store/solveHubStore';
import { getAvatarColor, formatTimeAgo, formatCount } from '../../utils/formatters';
import SolutionCard from '../solution/SolutionCard';
import PostItem from '../post/PostItem';
import LivePreviewModal from '../preview/LivePreviewModal';

export default function UserProfileView() {
  const { posts, viewingUser, currentUser, setActiveView } = useSolveHubStore();
  const targetUserName = viewingUser || currentUser.name;
  const isMe = targetUserName === currentUser.name;

  const [activeTab, setActiveTab] = useState('solutions'); // 'solutions' | 'problems'
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    title: '',
    srcDoc: null,
    url: null,
  });

  // Collect all solutions contributed by this user across all posts
  const userSolutions = useMemo(() => {
    const list = [];
    posts.forEach((p) => {
      p.cm?.forEach((c) => {
        if (c.a === targetUserName) {
          list.push({ solution: c, post: p });
        }
      });
    });
    return list;
  }, [posts, targetUserName]);

  // Collect all problem posts created by this user
  const userPosts = useMemo(() => {
    return posts.filter((p) => p.a === targetUserName);
  }, [posts, targetUserName]);

  const helpfulCount = userSolutions.filter((item) => item.solution.help).length;

  const openPreview = ({ title, srcDoc, url }) => {
    setPreviewState({
      isOpen: true,
      title: title || 'Live Preview',
      srcDoc: srcDoc || null,
      url: url || null,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView('home')}
          className="text-xs text-[#8c8c93] hover:text-white bg-[#131314] hover:bg-[#1b1b1d] border border-[#2a2a2d] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <span>←</span>
          <span>Back to Feed</span>
        </button>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-[#131314] border border-[#2a2a2d] rounded-2xl p-5 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-[#f4ef5a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-black text-2xl select-none flex-shrink-0 shadow-lg"
            style={{ backgroundColor: getAvatarColor(targetUserName) }}
          >
            {targetUserName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#f2f2f2]">{targetUserName}</h1>
              <span className="text-[#3b9cff] text-sm font-bold" title="Verified Member">
                ✔
              </span>
              {isMe && (
                <span className="text-[10px] bg-[#f4ef5a] text-black font-semibold px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-[#8c8c93]">@{targetUserName.toLowerCase().replace(/\s+/g, '')}</p>
            <p className="text-xs text-[#d0d0d5] mt-1">
              Active problem solver and solution contributor on SolveHub.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl px-4 py-2.5">
            <div className="text-center">
              <p className="text-base font-bold text-[#f4ef5a]">{userSolutions.length}</p>
              <p className="text-[10px] text-[#8c8c93]">Solutions</p>
            </div>
            <div className="w-px h-8 bg-[#2a2a2d]" />
            <div className="text-center">
              <p className="text-base font-bold text-[#3ddc84]">{helpfulCount}</p>
              <p className="text-[10px] text-[#8c8c93]">Helpful 🏆</p>
            </div>
            <div className="w-px h-8 bg-[#2a2a2d]" />
            <div className="text-center">
              <p className="text-base font-bold text-white">{userPosts.length}</p>
              <p className="text-[10px] text-[#8c8c93]">Problems</p>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex gap-2 border-t border-[#2a2a2d] pt-4 mt-4">
          <button
            onClick={() => setActiveTab('solutions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'solutions'
                ? 'bg-[#f4ef5a] text-black shadow-sm'
                : 'text-[#8c8c93] hover:text-white hover:bg-[#1b1b1d]'
            }`}
          >
            <span>🏆</span>
            <span>Solutions Portfolio ({userSolutions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'problems'
                ? 'bg-[#f4ef5a] text-black shadow-sm'
                : 'text-[#8c8c93] hover:text-white hover:bg-[#1b1b1d]'
            }`}
          >
            <span>❓</span>
            <span>Problems Asked ({userPosts.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'solutions' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8c8c93] px-1">
            <span>Portfolio of code, projects, websites, and solutions contributed</span>
            <span>{userSolutions.length} total</span>
          </div>

          {userSolutions.map(({ solution, post }) => (
            <div key={solution.id} className="bg-[#131314] border border-[#2a2a2d] rounded-2xl p-4 space-y-2.5">
              {/* Reference to the problem post */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2a2a2d]/60">
                <div className="min-w-0">
                  <span className="text-[#8c8c93]">Solution for: </span>
                  <span className="font-semibold text-[#f2f2f2] hover:text-[#f4ef5a] transition-colors truncate">
                    "{post.title}"
                  </span>
                </div>
                <span className="text-[11px] text-[#8c8c93] ml-2 flex-shrink-0">
                  {post.c}
                </span>
              </div>

              {/* Render the solution card */}
              <SolutionCard
                solution={solution}
                post={post}
                onPreviewRequest={openPreview}
                onToggleHelpful={() => {}}
              />
            </div>
          ))}

          {userSolutions.length === 0 && (
            <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-8 text-center text-[#8c8c93] text-sm">
              No solutions contributed yet. Reply to any problem post with text, code, or a project to build your portfolio!
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {userPosts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}

          {userPosts.length === 0 && (
            <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-8 text-center text-[#8c8c93] text-sm">
              No problems asked yet.
            </div>
          )}
        </div>
      )}

      {/* Live Sandboxed Preview Modal */}
      <LivePreviewModal
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState({ ...previewState, isOpen: false })}
        title={previewState.title}
        srcDoc={previewState.srcDoc}
        url={previewState.url}
      />
    </div>
  );
}
