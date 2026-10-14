import { useSolveHubStore } from '../../store/solveHubStore';
import PostComposer from '../post/PostComposer';
import PostItem from '../post/PostItem';
import UserProfileView from '../profile/UserProfileView';
import { formatCount } from '../../utils/formatters';

export default function FeedContainer() {
  const {
    posts,
    communities,
    activeView,
    selectedCommunity,
    setSelectedCommunity,
    searchQuery,
    joinCommunity,
    currentUser,
  } = useSolveHubStore();

  if (activeView === 'profile') {
    return (
      <div className="flex-1 min-w-0 max-w-2xl py-2">
        <UserProfileView />
      </div>
    );
  }

  // Determine which posts to show based on activeView, selectedCommunity, and searchQuery
  let displayedPosts = [...posts];
  let communityHeader = null;

  if (selectedCommunity) {
    const comm = communities.find((c) => c.n === selectedCommunity);
    displayedPosts = posts.filter((p) => p.c === selectedCommunity);
    communityHeader = (
      <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1b1b1d] flex items-center justify-center text-2xl">
            {comm?.i || '✨'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#f2f2f2]">{selectedCommunity}</h2>
            <p className="text-xs text-[#8c8c93]">
              {comm?.d || 'Community discussion and problems'} • {formatCount(comm?.m || 0)} Members
            </p>
          </div>
        </div>
        <button
          onClick={() => joinCommunity(selectedCommunity)}
          className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
            comm?.j
              ? 'bg-[#1b1b1d] text-[#f2f2f2] border border-[#2a2a2d]'
              : 'bg-white text-black'
          }`}
        >
          {comm?.j ? 'Joined' : 'Join'}
        </button>
      </div>
    );
  } else if (activeView === 'saved') {
    displayedPosts = posts.filter((p) => p.saves?.includes(currentUser.name));
  } else if (activeView === 'trending') {
    displayedPosts = [...posts].sort((a, b) => b.up - b.dn - (a.up - a.dn));
  } else if (activeView === 'explore' || searchQuery) {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      displayedPosts = posts.filter((p) => {
        const textToMatch = `${p.title} ${p.body} ${p.a} ${p.c} ${p.tags?.map((t) => '#' + t).join(' ')}`.toLowerCase();
        return textToMatch.includes(query);
      });
    }
  }

  // If in 'comms' view and no single community selected, display communities directory
  if (activeView === 'comms' && !selectedCommunity) {
    return (
      <div className="flex-1 min-w-0 max-w-2xl py-2 space-y-3">
        <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-4 mb-3">
          <h2 className="text-lg font-semibold text-[#f2f2f2]">All Communities</h2>
          <p className="text-xs text-[#8c8c93] mt-0.5">Explore and join specialized problem-solving hubs.</p>
        </div>
        <div className="space-y-2.5">
          {communities.map((c) => (
            <div
              key={c.id || c.n}
              className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-4 flex items-center gap-3.5 hover:border-[#353539] transition-all"
            >
              <div
                onClick={() => setSelectedCommunity(c.n)}
                className="w-12 h-12 rounded-xl bg-[#1b1b1d] flex items-center justify-center text-2xl cursor-pointer flex-shrink-0"
              >
                {c.i}
              </div>
              <div
                onClick={() => setSelectedCommunity(c.n)}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <h3 className="font-semibold text-sm md:text-base text-[#f2f2f2] hover:text-[#f4ef5a] transition-colors truncate">
                  {c.n}
                </h3>
                <p className="text-xs text-[#8c8c93] truncate mt-0.5">{c.d}</p>
                <span className="text-[11px] text-[#8c8c93] mt-1 inline-block">
                  {formatCount(c.m)} members
                </span>
              </div>
              <button
                onClick={() => joinCommunity(c.n)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex-shrink-0 ${
                  c.j
                    ? 'bg-[#1b1b1d] text-[#f2f2f2] border border-[#2a2a2d]'
                    : 'bg-white hover:bg-gray-100 text-black'
                }`}
              >
                {c.j ? 'Joined' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 max-w-2xl py-2">
      {/* Community Header Banner */}
      {communityHeader}

      {/* Show Composer on Home view or when viewing a specific community */}
      {(activeView === 'home' || selectedCommunity) && <PostComposer />}

      {/* View Header for Saved / Explore / Trending */}
      {activeView === 'saved' && (
        <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-3.5 mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#f2f2f2]">🔖 Saved Problems & Solutions</span>
          <span className="text-xs text-[#8c8c93]">{displayedPosts.length} items</span>
        </div>
      )}
      {activeView === 'trending' && (
        <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-3.5 mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#f2f2f2]">📈 Trending by Community Upvotes</span>
          <span className="text-xs text-[#8c8c93]">Top ranked</span>
        </div>
      )}
      {searchQuery && (
        <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-3.5 mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#f2f2f2]">
            Search results for "{searchQuery}"
          </span>
          <span className="text-xs text-[#8c8c93]">{displayedPosts.length} found</span>
        </div>
      )}

      {/* Post List */}
      <div className="space-y-3">
        {displayedPosts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}

        {displayedPosts.length === 0 && (
          <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-8 text-center text-[#8c8c93] text-sm">
            {activeView === 'saved'
              ? 'You have not saved any posts yet. Tap "🔖 Save" on any post to bookmark it here.'
              : 'No problems found in this view. Share the first one above!'}
          </div>
        )}
      </div>
    </div>
  );
}
